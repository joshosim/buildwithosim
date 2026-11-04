"""What a worker thread does with one job, from queue to finished files."""

from __future__ import annotations

import logging
import re
import shutil
import zipfile
from pathlib import Path, PureWindowsPath

from .catalog import ModelSpec
from .errors import SeparationCancelled, SeparationError
from .jobs import Job, JobStore, StemFile
from .separators.base import Separator

logger = logging.getLogger("stem_engine.pipeline")


def display_filename(raw: str | None) -> str:
    """A short, printable version of the client's file name. Never used as a path."""
    name = PureWindowsPath(raw or "").name  # also strips POSIX separators
    name = "".join(ch for ch in name if ch.isprintable())
    return name[:120] or "track"


def safe_base_name(filename: str) -> str:
    """Name stem used for download file names: ASCII letters, digits and ``._-`` only."""
    stem = Path(PureWindowsPath(filename).name).stem
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-")
    return cleaned[:60] or "track"


def download_name(job_filename: str, stem: str, fmt: str) -> str:
    return f"{safe_base_name(job_filename)}_{stem}.{fmt}"


def build_archive(job: Job, stems: list[StemFile]) -> Path:
    archive = job.dir / "stems.zip"
    # Audio is already compressed (MP3) or barely compressible (WAV): store, don't deflate.
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_STORED) as bundle:
        for stem in stems:
            bundle.write(stem.path, arcname=download_name(job.filename, stem.name, stem.format))
    return archive


def _discard_outputs(job: Job) -> None:
    shutil.rmtree(job.dir / "stems", ignore_errors=True)
    (job.dir / "stems.zip").unlink(missing_ok=True)


def run_job(job: Job, *, store: JobStore, separator: Separator, spec: ModelSpec) -> None:
    try:
        if not store.mark_processing(job):
            return  # deleted while it was waiting in the queue
        if job.input_path is None:  # pragma: no cover - set before the job is submitted
            raise SeparationError("separation_failed", "Separation failed unexpectedly. Please try again.")

        def report(stage: str, progress: float | None = None) -> None:
            store.report(job, stage, progress)

        outputs = separator.separate(
            input_path=job.input_path,
            spec=spec,
            output_dir=job.dir / "stems",
            output_format=job.output_format,
            report=report,
            is_cancelled=lambda: job.cancelled,
        )
        stems = [
            StemFile(name=o.name, path=o.path, format=job.output_format, size_bytes=o.path.stat().st_size)
            for o in outputs
        ]
        archive = build_archive(job, stems)
        store.complete(job, stems, archive, archive.stat().st_size)
    except SeparationCancelled:
        logger.info("job %s cancelled", job.id)
    except SeparationError as exc:
        logger.warning("job %s failed: %s", job.id, exc.code)
        _discard_outputs(job)
        store.fail(job, exc.code, exc.message)
    except Exception:
        logger.exception("job %s failed unexpectedly", job.id)
        _discard_outputs(job)
        store.fail(job, "separation_failed", "Separation failed unexpectedly. Please try again.")
    finally:
        store.discard_input(job)
        if job.cancelled:
            store.finalize_cancelled(job)
