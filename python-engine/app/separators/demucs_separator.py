"""Demucs-backed separator.

``torch`` and ``demucs`` are imported lazily so the rest of the engine (and its
tests) work without them installed, and so the server starts quickly.
"""

from __future__ import annotations

import importlib.util
import logging
import threading
from collections import OrderedDict
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..catalog import ModelSpec
from ..config import Settings
from ..errors import SeparationCancelled, SeparationError
from ..jobs import STAGE_DECODING, STAGE_ENCODING, STAGE_LOADING_MODEL, STAGE_SEPARATING
from ..progress import fraction_complete
from .base import OutputStem, ProgressReporter

logger = logging.getLogger("stem_engine.demucs")

OVERLAP = 0.25  # Demucs' own default; used for separation and kept explicit here.
MP3_BITRATE = 320


def demucs_installed() -> bool:
    return importlib.util.find_spec("demucs") is not None


@dataclass
class _Loaded:
    separator: Any  # demucs.api.Separator
    lock: threading.Lock


def _segment_frames(separator: Any) -> int:
    """Length of one model segment in frames, read from the first model in the bag."""
    model = separator.model
    inner = model.models[0] if hasattr(model, "models") else model
    segment = getattr(inner, "segment", None)
    if not segment:
        return 0
    return int(float(segment) * separator.samplerate)


class _ProgressTracker:
    """Demucs callback: reports stage/progress and aborts the run when cancelled."""

    def __init__(
        self,
        report: ProgressReporter,
        is_cancelled: Callable[[], bool],
        *,
        shifts: int,
        segment_frames: int,
    ) -> None:
        self._report = report
        self._is_cancelled = is_cancelled
        self._shifts = shifts
        self._segment_frames = segment_frames
        self._started = False

    def __call__(self, event: dict) -> None:
        if self._is_cancelled():
            # Documented way to abort: Demucs cancels the remaining segments.
            raise KeyboardInterrupt
        if not self._started:
            # The first segment starting means the file has been decoded.
            self._started = True
            self._report(STAGE_SEPARATING, None)
        fraction = fraction_complete(event, shifts=self._shifts, segment_frames=self._segment_frames)
        if fraction is not None:
            self._report(STAGE_SEPARATING, fraction)


def _looks_like_out_of_memory(exc: BaseException) -> bool:
    text = str(exc).lower()
    return isinstance(exc, MemoryError) or any(
        marker in text for marker in ("out of memory", "can't allocate memory", "not enough memory")
    )


class DemucsSeparator:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._cache: OrderedDict[str, _Loaded] = OrderedDict()
        self._cache_lock = threading.Lock()
        self._device: str | None = None

    def _resolve_device(self) -> str:
        if self._device is None:
            requested = self._settings.device
            if requested == "auto":
                import torch

                requested = "cuda" if torch.cuda.is_available() else "cpu"
            self._device = requested
        return self._device

    def _load(self, demucs_name: str) -> _Loaded:
        with self._cache_lock:
            cached = self._cache.get(demucs_name)
            if cached is not None:
                self._cache.move_to_end(demucs_name)
                return cached

        try:
            from demucs.api import Separator as DemucsApiSeparator
        except ImportError:
            raise SeparationError(
                "engine_not_installed",
                "Demucs isn't installed on the separation engine. See python-engine/README.md.",
            ) from None

        try:
            separator = DemucsApiSeparator(
                model=demucs_name,
                device=self._resolve_device(),
                shifts=self._settings.shifts,
                overlap=OVERLAP,
                split=True,
                jobs=self._settings.jobs,
                progress=False,
            )
        except Exception:
            logger.exception("could not load model %s", demucs_name)
            raise SeparationError(
                "model_unavailable",
                "The separation model couldn't be loaded. The first run downloads the model weights, "
                "so the engine needs internet access, or run scripts/download_models.py beforehand.",
            ) from None

        loaded = _Loaded(separator=separator, lock=threading.Lock())
        with self._cache_lock:
            self._cache[demucs_name] = loaded
            while len(self._cache) > self._settings.model_cache_size:
                self._cache.popitem(last=False)
        return loaded

    def separate(
        self,
        *,
        input_path: Path,
        spec: ModelSpec,
        output_dir: Path,
        output_format: str,
        report: ProgressReporter,
        is_cancelled: Callable[[], bool],
    ) -> list[OutputStem]:
        report(STAGE_LOADING_MODEL, None)
        loaded = self._load(spec.demucs_name)

        if is_cancelled():
            raise SeparationCancelled

        with loaded.lock:
            separator = loaded.separator
            if set(separator.model.sources) != set(spec.native_stems):
                logger.error("model %s reports sources %s", spec.demucs_name, separator.model.sources)
                raise SeparationError(
                    "model_mismatch",
                    "The loaded model doesn't produce the stems this option promises, so the job was stopped.",
                )

            tracker = _ProgressTracker(
                report,
                is_cancelled,
                shifts=self._settings.shifts,
                segment_frames=_segment_frames(separator),
            )
            separator.update_parameter(callback=tracker, callback_arg={})

            report(STAGE_DECODING, None)
            try:
                _, separated = separator.separate_audio_file(input_path)
            except KeyboardInterrupt:
                raise SeparationCancelled from None
            except Exception as exc:
                raise self._explain(exc) from None
            finally:
                separator.update_parameter(callback=None, callback_arg={})

        if is_cancelled():
            raise SeparationCancelled

        report(STAGE_ENCODING, None)
        try:
            return self._write_outputs(separated, separator.samplerate, spec, output_dir, output_format)
        except Exception:
            logger.exception("could not write stems")
            raise SeparationError("encode_failed", "The separated audio couldn't be saved.") from None

    @staticmethod
    def _explain(exc: Exception) -> SeparationError:
        try:
            from demucs.api import LoadAudioError
        except ImportError:  # pragma: no cover - demucs was importable a moment ago
            LoadAudioError = ()  # type: ignore[assignment]  # noqa: N806

        if isinstance(exc, LoadAudioError):
            logger.warning("decode failed: %s", exc)
            return SeparationError(
                "decode_failed", "The audio couldn't be decoded. The file may be corrupt or use an unsupported codec."
            )
        if _looks_like_out_of_memory(exc):
            logger.error("out of memory during separation")
            return SeparationError(
                "out_of_memory",
                "The engine ran out of memory on this track. Try a shorter file, or a smaller model.",
            )
        logger.exception("separation failed")
        return SeparationError("separation_failed", "Separation failed unexpectedly. Please try again.")

    @staticmethod
    def _write_outputs(
        separated: dict[str, Any],
        samplerate: int,
        spec: ModelSpec,
        output_dir: Path,
        output_format: str,
    ) -> list[OutputStem]:
        from demucs.api import save_audio

        output_dir.mkdir(parents=True, exist_ok=True)

        non_vocal = [tensor for name, tensor in separated.items() if name != "vocals"]
        accompaniment = non_vocal[0].clone()
        for tensor in non_vocal[1:]:
            accompaniment += tensor

        tensors = {"vocals": separated["vocals"], "accompaniment": accompaniment}
        if spec.returns_instrument_stems:
            tensors.update({name: separated[name] for name in spec.native_stems if name != "vocals"})

        outputs: list[OutputStem] = []
        for name in spec.output_stems:
            path = output_dir / f"{name}.{output_format}"
            save_audio(
                tensors[name],
                str(path),
                samplerate=samplerate,
                bitrate=MP3_BITRATE,
                clip="rescale",
                bits_per_sample=16,
            )
            outputs.append(OutputStem(name=name, path=path))
        return outputs
