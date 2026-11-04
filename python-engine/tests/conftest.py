from __future__ import annotations

import io
import math
import struct
import threading
import time
import wave
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.catalog import ModelSpec
from app.config import Settings
from app.errors import SeparationCancelled
from app.main import create_app
from app.separators.base import OutputStem

CONTRACT_DIR = Path(__file__).resolve().parent.parent / "contract"


def make_wav_bytes(seconds: float = 1.0, rate: int = 8000, channels: int = 1, freq: float = 440.0) -> bytes:
    """A real, decodable PCM WAV (a quiet sine)."""
    frames = bytearray()
    for n in range(int(seconds * rate)):
        sample = int(8000 * math.sin(2 * math.pi * freq * n / rate))
        frames += struct.pack("<h", sample) * channels
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(bytes(frames))
    return buffer.getvalue()


class FakeSeparator:
    """Stands in for Demucs: writes small files for each stem and obeys the Separator protocol.

    Tests can hold it mid-run with ``gate`` (an Event the job waits on) or make it fail
    with ``fail_with``.
    """

    def __init__(self) -> None:
        self.gate: threading.Event | None = None
        self.fail_with: BaseException | None = None
        self.started = threading.Event()
        self.calls: list[dict] = []

    def separate(
        self,
        *,
        input_path: Path,
        spec: ModelSpec,
        output_dir: Path,
        output_format: str,
        report: Callable[[str, float | None], None],
        is_cancelled: Callable[[], bool],
    ) -> list[OutputStem]:
        self.calls.append({"model": spec.id, "format": output_format, "input_existed": input_path.exists()})
        self.started.set()
        report("loading_model", None)
        report("decoding", None)
        report("separating", None)
        report("separating", 0.4)
        if self.gate is not None:
            while not self.gate.wait(0.01):
                if is_cancelled():
                    raise SeparationCancelled
        if is_cancelled():
            raise SeparationCancelled
        if self.fail_with is not None:
            raise self.fail_with
        output_dir.mkdir(parents=True, exist_ok=True)
        report("encoding", None)
        payload = make_wav_bytes(0.2) if output_format == "wav" else b"\xff\xfb\x90\x00" + b"\x00" * 200
        outputs = []
        for name in spec.output_stems:
            path = output_dir / f"{name}.{output_format}"
            path.write_bytes(payload)
            outputs.append(OutputStem(name=name, path=path))
        return outputs


def make_settings(tmp_path: Path, **overrides: str) -> Settings:
    env = {
        "STEM_WORK_DIR": str(tmp_path / "work"),
        "STEM_MAX_UPLOAD_MB": "1",
        "STEM_MAX_DURATION_SECONDS": "30",
        "STEM_JOB_TTL_SECONDS": "60",
        **overrides,
    }
    return Settings.from_env(env)


@pytest.fixture
def separator() -> FakeSeparator:
    return FakeSeparator()


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return make_settings(tmp_path)


@pytest.fixture
def client(settings: Settings, separator: FakeSeparator) -> Iterator[TestClient]:
    with TestClient(create_app(settings, separator)) as test_client:
        yield test_client


def upload(
    client: TestClient,
    data: bytes | None = None,
    filename: str = "song.wav",
    model: str | None = None,
    fmt: str | None = None,
    headers: dict[str, str] | None = None,
):
    payload = make_wav_bytes() if data is None else data
    form: dict[str, str] = {}
    if model is not None:
        form["model"] = model
    if fmt is not None:
        form["format"] = fmt
    return client.post("/jobs", files={"file": (filename, payload, "audio/wav")}, data=form, headers=headers)


def wait_for(client: TestClient, job_id: str, statuses=("completed", "failed"), timeout: float = 5.0) -> dict:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        body = client.get(f"/jobs/{job_id}").json()
        if body["status"] in statuses:
            return body
        time.sleep(0.02)
    raise AssertionError(f"job {job_id} did not reach {statuses} in {timeout}s; last: {body}")


def shape(value):
    """The structure of a JSON value: keys and types, ignoring the values themselves."""
    if isinstance(value, dict):
        return {key: shape(item) for key, item in sorted(value.items())}
    if isinstance(value, list):
        return [shape(value[0])] if value else []
    if value is None:
        return "null"
    return type(value).__name__
