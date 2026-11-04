"""Response bodies. This file is the API contract the Next.js client is written against.

Example payloads that both this test suite and the frontend tests load live in
``python-engine/contract/``; change them together.
"""

from __future__ import annotations

from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorOut(BaseModel):
    error: ErrorBody


class HealthOut(BaseModel):
    status: str
    ffmpeg: bool
    demucs: bool
    active_jobs: int


class LimitsOut(BaseModel):
    max_upload_mb: int
    max_duration_seconds: int
    allowed_extensions: list[str]
    output_formats: list[str]
    job_ttl_seconds: int


class ModelOut(BaseModel):
    id: str
    label: str
    description: str
    # Stems a finished job contains, in display order (includes "accompaniment").
    stems: list[str]
    # What the network itself predicts.
    native_stems: list[str]
    # False when only vocals + accompaniment are returned.
    returns_instrument_stems: bool
    experimental: bool
    relative_speed: str  # "baseline" | "slower"


class ModelsOut(BaseModel):
    models: list[ModelOut]
    default_model: str
    limits: LimitsOut


class StemOut(BaseModel):
    name: str
    label: str
    kind: str  # "vocals" | "accompaniment" | "instrument"
    format: str  # "wav" | "mp3"
    size_bytes: int
    url: str  # inline playback
    download_url: str  # same file, served as an attachment


class ArchiveOut(BaseModel):
    download_url: str
    size_bytes: int


class JobOut(BaseModel):
    job_id: str
    status: str  # "queued" | "processing" | "completed" | "failed"
    # "queued" | "loading_model" | "decoding" | "separating" | "encoding" | "done"
    stage: str
    # 0..1 while separating, derived from the model's own segment callbacks. null when unknown.
    progress: float | None
    model: str
    format: str
    filename: str
    created_at: str
    expires_at: str | None
    error: ErrorBody | None
    stems: list[StemOut] | None
    archive: ArchiveOut | None
