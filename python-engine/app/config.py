"""Runtime configuration, read once from environment variables (prefix ``STEM_``)."""

from __future__ import annotations

import os
import tempfile
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

from .catalog import DEFAULT_MODEL_ID, MODELS_BY_ID

ALLOWED_EXTENSIONS: tuple[str, ...] = (
    ".mp3",
    ".wav",
    ".flac",
    ".ogg",
    ".oga",
    ".opus",
    ".m4a",
    ".aac",
    ".aif",
    ".aiff",
)

DEVICES = ("auto", "cpu", "cuda", "mps")

# multipart framing and the small form fields that travel with the file.
UPLOAD_OVERHEAD_BYTES = 64 * 1024


class ConfigError(ValueError):
    """Raised at startup for a malformed setting, with a message naming it."""


def _read_int(env: Mapping[str, str], name: str, default: int, *, minimum: int, maximum: int | None = None) -> int:
    raw = env.get(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        value = int(raw)
    except ValueError:
        raise ConfigError(f"{name} must be a whole number, got {raw!r}") from None
    if value < minimum or (maximum is not None and value > maximum):
        bound = f"between {minimum} and {maximum}" if maximum is not None else f"at least {minimum}"
        raise ConfigError(f"{name} must be {bound}, got {value}")
    return value


def _read_list(env: Mapping[str, str], name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = env.get(name)
    if raw is None or raw.strip() == "":
        return default
    return tuple(part.strip() for part in raw.split(",") if part.strip())


@dataclass(frozen=True)
class Settings:
    work_dir: Path
    cors_origins: tuple[str, ...]
    max_upload_mb: int
    max_duration_seconds: int
    job_ttl_seconds: int
    sweep_interval_seconds: int
    max_queue: int
    max_concurrent_jobs: int
    device: str
    jobs: int
    shifts: int
    model_cache_size: int
    enabled_models: tuple[str, ...]
    default_model: str
    reader_data_dir: Path
    allowed_extensions: tuple[str, ...] = ALLOWED_EXTENSIONS

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> Settings:
        env = os.environ if env is None else env

        work_dir = Path(env.get("STEM_WORK_DIR") or Path(tempfile.gettempdir()) / "stem-engine").expanduser()

        device = (env.get("STEM_DEVICE") or "auto").strip().lower()
        if device not in DEVICES:
            raise ConfigError(f"STEM_DEVICE must be one of {', '.join(DEVICES)}, got {device!r}")

        enabled = _read_list(env, "STEM_ENABLED_MODELS", tuple(MODELS_BY_ID))
        unknown = [m for m in enabled if m not in MODELS_BY_ID]
        if unknown:
            raise ConfigError(
                f"STEM_ENABLED_MODELS has unknown model(s) {', '.join(unknown)}; "
                f"valid ids are {', '.join(MODELS_BY_ID)}"
            )

        default_model = (env.get("STEM_DEFAULT_MODEL") or "").strip() or (
            DEFAULT_MODEL_ID if DEFAULT_MODEL_ID in enabled else enabled[0]
        )
        if default_model not in enabled:
            raise ConfigError(f"STEM_DEFAULT_MODEL {default_model!r} is not in STEM_ENABLED_MODELS")

        return cls(
            work_dir=work_dir,
            cors_origins=_read_list(env, "STEM_CORS_ORIGINS", ("http://localhost:3000", "http://127.0.0.1:3000")),
            max_upload_mb=_read_int(env, "STEM_MAX_UPLOAD_MB", 150, minimum=1, maximum=2048),
            max_duration_seconds=_read_int(env, "STEM_MAX_DURATION_SECONDS", 600, minimum=10),
            job_ttl_seconds=_read_int(env, "STEM_JOB_TTL_SECONDS", 3600, minimum=60),
            sweep_interval_seconds=_read_int(env, "STEM_SWEEP_INTERVAL_SECONDS", 60, minimum=5),
            max_queue=_read_int(env, "STEM_MAX_QUEUE", 8, minimum=1),
            max_concurrent_jobs=_read_int(env, "STEM_MAX_CONCURRENT_JOBS", 1, minimum=1, maximum=8),
            device=device,
            jobs=_read_int(env, "STEM_JOBS", 0, minimum=0, maximum=64),
            shifts=_read_int(env, "STEM_SHIFTS", 1, minimum=0, maximum=10),
            model_cache_size=_read_int(env, "STEM_MODEL_CACHE_SIZE", 1, minimum=1, maximum=4),
            enabled_models=enabled,
            default_model=default_model,
            reader_data_dir=Path(env.get("READER_DATA_DIR") or Path.home() / ".buildwithosim-reader").expanduser(),
        )
