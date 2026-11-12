"""HTTP API for the stem separation engine.

Endpoints
---------
``GET    /health``                       liveness plus whether ffmpeg / demucs are present
``GET    /models``                       selectable models, and the upload limits
``POST   /jobs``                         multipart: ``file``, ``model``, ``format``  ->  202 + job
``GET    /jobs/{id}``                    job status; stem URLs once completed
``DELETE /jobs/{id}``                    cancel and/or delete the job and its files
``GET    /jobs/{id}/stems/{stem}``       one stem (``?download=1`` forces a download)
``GET    /jobs/{id}/archive``            every stem as a zip

Separation is slow, so it is asynchronous: ``POST /jobs`` validates the upload
and returns at once; the client polls ``GET /jobs/{id}``.

All errors have the same shape: ``{"error": {"code": "...", "message": "..."}}``.
"""

from __future__ import annotations

import asyncio
import importlib.util
import io
import logging
import os
import tempfile
import wave
from collections.abc import AsyncIterator
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import __version__
from .audio_probe import ffmpeg_available, probe_audio
from .catalog import MODELS_BY_ID, OUTPUT_FORMATS, STEM_LABELS, ModelSpec, stem_kind
from .config import UPLOAD_OVERHEAD_BYTES, Settings
from .errors import EngineHTTPError
from .jobs import STATUS_COMPLETED, JobStore, JobView
from .pipeline import display_filename, download_name, run_job
from .schemas import (
    ArchiveOut,
    ErrorBody,
    HealthOut,
    JobOut,
    LimitsOut,
    ModelOut,
    ModelsOut,
    StemOut,
)
from .separators.base import Separator
from .separators.demucs_separator import DemucsSeparator, demucs_installed
from .upload_limit import UploadSizeLimitMiddleware

logger = logging.getLogger("stem_engine")

MEDIA_TYPES = {"wav": "audio/wav", "mp3": "audio/mpeg"}
UPLOAD_CHUNK = 1024 * 1024


def _iso(timestamp: float | None) -> str | None:
    if timestamp is None:
        return None
    return datetime.fromtimestamp(timestamp, tz=UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def _minutes(seconds: float) -> str:
    whole = int(seconds // 60)
    rest = int(seconds % 60)
    return f"{whole}:{rest:02d}"


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
        headers={"Cache-Control": "no-store"},
    )


def no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"


def _tts_available() -> bool:
    return importlib.util.find_spec("chatterbox") is not None and importlib.util.find_spec("torchaudio") is not None


def create_app(settings: Settings | None = None, separator: Separator | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    store = JobStore(settings.work_dir, settings.job_ttl_seconds)
    separator = separator or DemucsSeparator(settings)
    executor = ThreadPoolExecutor(max_workers=settings.max_concurrent_jobs, thread_name_prefix="separate")

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        removed = await run_in_threadpool(store.purge_orphans)
        if removed:
            logger.info("removed %d leftover job directories from a previous run", removed)
        if not ffmpeg_available():
            logger.warning("ffmpeg/ffprobe not found on PATH: uploads will be rejected until it is installed")

        async def sweep_forever() -> None:
            while True:
                await asyncio.sleep(settings.sweep_interval_seconds)
                try:
                    await run_in_threadpool(store.sweep)
                except Exception:  # keep the sweeper alive whatever happens
                    logger.exception("cleanup sweep failed")

        sweeper = asyncio.create_task(sweep_forever())
        try:
            yield
        finally:
            sweeper.cancel()
            executor.shutdown(wait=False, cancel_futures=True)

    app = FastAPI(
        title="Stem separation engine",
        version=__version__,
        description="Upload a track, poll the job, download vocals, accompaniment and (model permitting) instrument stems.",
        lifespan=lifespan,
    )

    # Added first so CORS (added last) wraps it and its 413 still carries CORS headers.
    app.add_middleware(
        UploadSizeLimitMiddleware,
        path="/jobs",
        max_bytes=settings.max_upload_bytes + UPLOAD_OVERHEAD_BYTES,
        message=f"That file is larger than the {settings.max_upload_mb} MB limit.",
    )
    app.add_middleware(
        UploadSizeLimitMiddleware,
        path="/api/documents/extract",
        max_bytes=26 * 1024 * 1024,
        message="PDFs must be smaller than 25 MB.",
    )
    app.add_middleware(
        UploadSizeLimitMiddleware,
        path="/api/voice/reference",
        max_bytes=11 * 1024 * 1024,
        message="Voice samples must be smaller than 10 MB.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    # -- errors --------------------------------------------------------------

    @app.exception_handler(EngineHTTPError)
    async def _engine_error(_request: Request, exc: EngineHTTPError) -> JSONResponse:
        return _error_response(exc.status_code, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
        missing_file = any(tuple(e.get("loc", ()))[-1:] == ("file",) for e in exc.errors())
        message = "Choose an audio file to upload." if missing_file else "The request wasn't valid."
        return _error_response(422, "invalid_request", message)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = {404: "not_found", 405: "method_not_allowed"}.get(exc.status_code, "http_error")
        message = "Not found." if exc.status_code == 404 else "That request isn't allowed."
        return _error_response(exc.status_code, code, message)

    @app.exception_handler(Exception)
    async def _unexpected(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled error", exc_info=exc)
        return _error_response(500, "internal_error", "Something went wrong on the server.")

    # -- helpers -------------------------------------------------------------

    def resolve_model(model_id: str) -> ModelSpec:
        spec = MODELS_BY_ID.get(model_id)
        if spec is None or model_id not in settings.enabled_models:
            raise EngineHTTPError(422, "unknown_model", "That separation model isn't available on this engine.")
        return spec

    def job_out(view: JobView) -> JobOut:
        stems: list[StemOut] | None = None
        archive: ArchiveOut | None = None
        if view.status == STATUS_COMPLETED:
            stems = [
                StemOut(
                    name=s.name,
                    label=STEM_LABELS.get(s.name, s.name.title()),
                    kind=stem_kind(s.name),
                    format=s.format,
                    size_bytes=s.size_bytes,
                    url=f"/jobs/{view.id}/stems/{s.name}",
                    download_url=f"/jobs/{view.id}/stems/{s.name}?download=1",
                )
                for s in view.stems
            ]
            if view.archive_size_bytes is not None:
                archive = ArchiveOut(download_url=f"/jobs/{view.id}/archive", size_bytes=view.archive_size_bytes)
        return JobOut(
            job_id=view.id,
            status=view.status,
            stage=view.stage,
            progress=view.progress,
            model=view.model_id,
            format=view.output_format,
            filename=view.filename,
            created_at=_iso(view.created_at) or "",
            expires_at=_iso(view.expires_at),
            error=ErrorBody(code=view.error[0], message=view.error[1]) if view.error else None,
            stems=stems,
            archive=archive,
        )

    async def save_upload(upload: UploadFile, destination: Path) -> None:
        written = 0
        with destination.open("wb") as out:
            while chunk := await upload.read(UPLOAD_CHUNK):
                written += len(chunk)
                if written > settings.max_upload_bytes:
                    raise EngineHTTPError(
                        413, "file_too_large", f"That file is larger than the {settings.max_upload_mb} MB limit."
                    )
                out.write(chunk)
        if written == 0:
            raise EngineHTTPError(400, "empty_file", "That file is empty.")

    # -- routes --------------------------------------------------------------

    @app.get("/health", response_model=HealthOut, dependencies=[Depends(no_store)])
    def health() -> HealthOut:
        return HealthOut(
            status="ok",
            ffmpeg=ffmpeg_available(),
            demucs=demucs_installed(),
            active_jobs=store.unfinished_count(),
        )

    @app.get("/api/reader/health", dependencies=[Depends(no_store)])
    def reader_health() -> dict[str, str]:
        return {"status": "ok", "tts": "available" if _tts_available() else "install chatterbox-tts and torchaudio"}

    @app.post("/api/documents/extract", dependencies=[Depends(no_store)])
    async def extract_document(file: UploadFile = File(...)) -> dict[str, object]:
        from pypdf import PdfReader
        from pypdf.errors import PdfReadError

        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise EngineHTTPError(415, "unsupported_type", "Upload a PDF document.")
        contents = await file.read(25 * 1024 * 1024 + 1)
        if len(contents) > 25 * 1024 * 1024:
            raise EngineHTTPError(413, "file_too_large", "PDFs must be smaller than 25 MB.")
        if not contents:
            raise EngineHTTPError(400, "empty_file", "That PDF is empty.")
        try:
            reader = PdfReader(io.BytesIO(contents), strict=False)
            page_texts = [(page.extract_text() or "").strip() for page in reader.pages]
        except (PdfReadError, ValueError) as exc:
            raise EngineHTTPError(422, "invalid_pdf", "This PDF could not be opened.") from exc
        if not any(page_texts):
            raise EngineHTTPError(422, "no_text", "No selectable text was found. This may be a scanned PDF; OCR is not configured.")
        return {"filename": Path(file.filename).name, "pages": len(page_texts), "page_texts": page_texts, "text": "\n\n".join(f"[Page {i + 1}]\n{text}" for i, text in enumerate(page_texts) if text)}

    @app.post("/api/voice/reference", dependencies=[Depends(no_store)])
    async def upload_voice_reference(file: UploadFile = File(...)) -> dict[str, str]:
        if not (file.filename or "").lower().endswith(".wav"):
            raise EngineHTTPError(415, "unsupported_type", "Upload a WAV voice recording.")
        data = await file.read(10 * 1024 * 1024 + 1)
        if len(data) > 10 * 1024 * 1024:
            raise EngineHTTPError(413, "file_too_large", "Voice samples must be smaller than 10 MB.")
        try:
            with wave.open(io.BytesIO(data), "rb") as wav:
                if wav.getnframes() < wav.getframerate() or wav.getframerate() < 16000:
                    raise ValueError("too short or low sample rate")
        except (wave.Error, ValueError) as exc:
            raise EngineHTTPError(422, "invalid_audio", "Upload a valid WAV recording at least one second long (16 kHz or higher).") from exc
        settings.reader_data_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
        target = settings.reader_data_dir / "voice-reference.wav"
        target.write_bytes(data)
        target.chmod(0o600)
        return {"status": "saved", "message": "Voice reference saved privately on this engine."}

    @app.post("/api/speech/generate", dependencies=[Depends(no_store)])
    async def generate_speech(payload: dict[str, object]) -> FileResponse:
        text = payload.get("text")
        if not isinstance(text, str) or not text.strip():
            raise EngineHTTPError(422, "invalid_text", "Provide text to read.")
        if len(text) > 12000:
            raise EngineHTTPError(413, "text_too_long", "Each speech segment must be 12,000 characters or fewer.")
        reference = settings.reader_data_dir / "voice-reference.wav"
        if not reference.is_file():
            raise EngineHTTPError(409, "voice_missing", "Upload a voice reference before generating speech.")
        try:
            from .tts_service import generate_wav
            fd, output = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            await run_in_threadpool(generate_wav, text.strip(), str(reference), output)
        except ImportError as exc:
            raise EngineHTTPError(503, "tts_unavailable", "Install the optional Chatterbox TTS dependencies to enable speech.") from exc
        except Exception as exc:
            if "output" in locals():
                Path(output).unlink(missing_ok=True)
            logger.exception("speech generation failed")
            raise EngineHTTPError(503, "tts_failed", "Speech generation failed. Check model installation and available memory.") from exc
        return FileResponse(output, media_type="audio/wav", filename="reader-segment.wav", background=BackgroundTask(Path(output).unlink, missing_ok=True), headers={"Cache-Control": "no-store"})

    @app.get("/models", response_model=ModelsOut, dependencies=[Depends(no_store)])
    def list_models() -> ModelsOut:
        return ModelsOut(
            models=[
                ModelOut(
                    id=spec.id,
                    label=spec.label,
                    description=spec.description,
                    stems=list(spec.output_stems),
                    native_stems=list(spec.native_stems),
                    returns_instrument_stems=spec.returns_instrument_stems,
                    experimental=spec.experimental,
                    relative_speed=spec.relative_speed,
                )
                for model_id in settings.enabled_models
                for spec in [MODELS_BY_ID[model_id]]
            ],
            default_model=settings.default_model,
            limits=LimitsOut(
                max_upload_mb=settings.max_upload_mb,
                max_duration_seconds=settings.max_duration_seconds,
                allowed_extensions=list(settings.allowed_extensions),
                output_formats=list(OUTPUT_FORMATS),
                job_ttl_seconds=settings.job_ttl_seconds,
            ),
        )

    @app.post("/jobs", status_code=202, response_model=JobOut, dependencies=[Depends(no_store)])
    async def create_job(
        response: Response,
        file: UploadFile = File(...),
        model: str = Form(settings.default_model),
        output_format: str = Form("wav", alias="format"),
    ) -> JobOut:
        spec = resolve_model(model)
        if output_format not in OUTPUT_FORMATS:
            raise EngineHTTPError(422, "unknown_format", f"Output format must be one of: {', '.join(OUTPUT_FORMATS)}.")

        extension = Path(file.filename or "").suffix.lower()
        if extension not in settings.allowed_extensions:
            allowed = ", ".join(e.lstrip(".").upper() for e in settings.allowed_extensions)
            raise EngineHTTPError(415, "unsupported_type", f"Unsupported file type. Use one of: {allowed}.")

        if store.unfinished_count() >= settings.max_queue:
            raise EngineHTTPError(
                429, "busy", "The engine is busy with other tracks right now. Please try again in a few minutes."
            )

        job = store.create(display_filename(file.filename), spec.id, output_format)
        try:
            job.input_path = job.dir / f"input{extension}"
            await save_upload(file, job.input_path)
            info = await run_in_threadpool(probe_audio, job.input_path)
            if info.duration_seconds > settings.max_duration_seconds:
                raise EngineHTTPError(
                    422,
                    "too_long",
                    f"That track is {_minutes(info.duration_seconds)} long. "
                    f"The limit is {_minutes(settings.max_duration_seconds)}.",
                )
            try:
                executor.submit(run_job, job, store=store, separator=separator, spec=spec)
            except RuntimeError:
                raise EngineHTTPError(503, "shutting_down", "The engine is shutting down. Please try again shortly.") from None
        except BaseException:
            store.delete(job.id)
            raise

        view = store.view(job.id)
        assert view is not None
        response.headers["Location"] = f"/jobs/{job.id}"
        return job_out(view)

    @app.get("/jobs/{job_id}", response_model=JobOut, dependencies=[Depends(no_store)])
    def get_job(job_id: str) -> JobOut:
        view = store.view(job_id)
        if view is None:
            raise EngineHTTPError(404, "job_not_found", "That job doesn't exist or has expired.")
        return job_out(view)

    @app.delete("/jobs/{job_id}", status_code=204)
    def delete_job(job_id: str) -> Response:
        if not store.delete(job_id):
            raise EngineHTTPError(404, "job_not_found", "That job doesn't exist or has expired.")
        return Response(status_code=204, headers={"Cache-Control": "no-store"})

    @app.get("/jobs/{job_id}/stems/{stem}")
    def get_stem(job_id: str, stem: str, download: bool = False) -> FileResponse:
        found = store.find_stem(job_id, stem)
        if found is None:
            raise EngineHTTPError(404, "stem_not_found", "That stem doesn't exist or has expired.")
        view, item = found
        return FileResponse(
            item.path,
            media_type=MEDIA_TYPES[item.format],
            filename=download_name(view.filename, item.name, item.format),
            content_disposition_type="attachment" if download else "inline",
            headers={"Cache-Control": "no-store"},
        )

    @app.get("/jobs/{job_id}/archive")
    def get_archive(job_id: str) -> FileResponse:
        found = store.archive_path(job_id)
        if found is None:
            raise EngineHTTPError(404, "archive_not_found", "That download doesn't exist or has expired.")
        view, path = found
        return FileResponse(
            path,
            media_type="application/zip",
            filename=download_name(view.filename, "stems", "zip"),
            content_disposition_type="attachment",
            headers={"Cache-Control": "no-store"},
        )

    return app


_default_app: FastAPI | None = None


def __getattr__(name: str) -> FastAPI:
    """Lazily build ``app`` so ``uvicorn app.main:app`` works without importing the
    module having side effects (creating work directories, reading the environment)."""
    global _default_app
    if name == "app":
        if _default_app is None:
            _default_app = create_app()
        return _default_app
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
