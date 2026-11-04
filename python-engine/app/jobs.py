"""In-memory job registry plus the on-disk work directory it manages.

Jobs live in memory only. Audio lives in a per-job directory under the work
directory and nowhere else: there is no database. Uploaded audio is deleted as
soon as processing ends; results are deleted ``job_ttl_seconds`` after they
finish, or immediately when the client deletes the job.

Only directories whose name is a 32-character hex job id are ever removed, so
pointing ``STEM_WORK_DIR`` at a directory that holds other files is safe.
"""

from __future__ import annotations

import logging
import re
import shutil
import threading
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("stem_engine.jobs")

JOB_ID_RE = re.compile(r"^[0-9a-f]{32}$")
STEM_NAME_RE = re.compile(r"^[a-z0-9_]{1,32}$")

STATUS_QUEUED = "queued"
STATUS_PROCESSING = "processing"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
FINISHED_STATUSES = (STATUS_COMPLETED, STATUS_FAILED)

STAGE_QUEUED = "queued"
STAGE_LOADING_MODEL = "loading_model"
STAGE_DECODING = "decoding"
STAGE_SEPARATING = "separating"
STAGE_ENCODING = "encoding"
STAGE_DONE = "done"


@dataclass(frozen=True)
class StemFile:
    name: str
    path: Path
    format: str
    size_bytes: int


@dataclass
class Job:
    id: str
    dir: Path
    filename: str
    model_id: str
    output_format: str
    created_at: float
    input_path: Path | None = None
    status: str = STATUS_QUEUED
    stage: str = STAGE_QUEUED
    progress: float | None = None
    error: tuple[str, str] | None = None
    stems: list[StemFile] = field(default_factory=list)
    archive: Path | None = None
    archive_size_bytes: int | None = None
    finished_at: float | None = None
    cancelled: bool = False


@dataclass(frozen=True)
class JobView:
    """An immutable, consistent copy of a job for building a response."""

    id: str
    status: str
    stage: str
    progress: float | None
    model_id: str
    output_format: str
    filename: str
    created_at: float
    finished_at: float | None
    expires_at: float | None
    error: tuple[str, str] | None
    stems: tuple[StemFile, ...]
    archive_size_bytes: int | None


def _remove_tree(path: Path) -> None:
    shutil.rmtree(path, ignore_errors=True)


class JobStore:
    def __init__(self, work_dir: Path, ttl_seconds: int, clock: Callable[[], float] = time.time) -> None:
        self._work_dir = work_dir
        self._ttl = ttl_seconds
        self._clock = clock
        self._lock = threading.RLock()
        self._jobs: dict[str, Job] = {}
        work_dir.mkdir(parents=True, exist_ok=True)

    # -- creation / lookup -------------------------------------------------

    def create(self, filename: str, model_id: str, output_format: str) -> Job:
        job_id = uuid.uuid4().hex
        job_dir = self._work_dir / job_id
        job_dir.mkdir(mode=0o700)
        job = Job(
            id=job_id,
            dir=job_dir,
            filename=filename,
            model_id=model_id,
            output_format=output_format,
            created_at=self._clock(),
        )
        with self._lock:
            self._jobs[job_id] = job
        return job

    def get(self, job_id: str) -> Job | None:
        if not JOB_ID_RE.match(job_id):
            return None
        with self._lock:
            return self._jobs.get(job_id)

    def unfinished_count(self) -> int:
        with self._lock:
            return sum(1 for j in self._jobs.values() if j.status not in FINISHED_STATUSES)

    def view(self, job_id: str) -> JobView | None:
        if not JOB_ID_RE.match(job_id):
            return None
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            expires_at = job.finished_at + self._ttl if job.finished_at is not None else None
            return JobView(
                id=job.id,
                status=job.status,
                stage=job.stage,
                progress=job.progress,
                model_id=job.model_id,
                output_format=job.output_format,
                filename=job.filename,
                created_at=job.created_at,
                finished_at=job.finished_at,
                expires_at=expires_at,
                error=job.error,
                stems=tuple(job.stems),
                archive_size_bytes=job.archive_size_bytes if job.archive is not None else None,
            )

    def find_stem(self, job_id: str, stem: str) -> tuple[JobView, StemFile] | None:
        """Look a stem up by name among the job's recorded outputs (never by path)."""
        if not STEM_NAME_RE.match(stem):
            return None
        view = self.view(job_id)
        if view is None or view.status != STATUS_COMPLETED:
            return None
        for item in view.stems:
            if item.name == stem:
                return view, item
        return None

    def archive_path(self, job_id: str) -> tuple[JobView, Path] | None:
        view = self.view(job_id)
        if view is None or view.status != STATUS_COMPLETED or view.archive_size_bytes is None:
            return None
        job = self.get(job_id)
        if job is None or job.archive is None:
            return None
        return view, job.archive

    # -- worker-side transitions ------------------------------------------

    def mark_processing(self, job: Job) -> bool:
        """Move to processing. False if the job was deleted while it waited."""
        with self._lock:
            if job.cancelled:
                return False
            job.status = STATUS_PROCESSING
            job.stage = STAGE_LOADING_MODEL
            return True

    def report(self, job: Job, stage: str, progress: float | None = None) -> None:
        """Record the current stage. ``progress`` is only meaningful while separating,
        never goes backwards, and is cleared when the stage changes."""
        with self._lock:
            if job.status != STATUS_PROCESSING:
                return
            if stage != job.stage:
                job.stage = stage
                job.progress = None
            if progress is not None:
                clamped = max(0.0, min(1.0, progress))
                job.progress = clamped if job.progress is None else max(job.progress, clamped)

    def complete(self, job: Job, stems: list[StemFile], archive: Path | None, archive_size_bytes: int | None) -> None:
        with self._lock:
            if job.cancelled:
                return
            job.stems = stems
            job.archive = archive
            job.archive_size_bytes = archive_size_bytes
            job.status = STATUS_COMPLETED
            job.stage = STAGE_DONE
            job.progress = 1.0
            job.finished_at = self._clock()

    def fail(self, job: Job, code: str, message: str) -> None:
        with self._lock:
            if job.cancelled:
                return
            job.status = STATUS_FAILED
            job.error = (code, message)
            job.progress = None
            job.finished_at = self._clock()

    # -- removal -----------------------------------------------------------

    def delete(self, job_id: str) -> bool:
        """Remove a job. A running job is flagged so its worker stops and cleans up."""
        if not JOB_ID_RE.match(job_id):
            return False
        with self._lock:
            job = self._jobs.pop(job_id, None)
            if job is None:
                return False
            job.cancelled = True
            running = job.status == STATUS_PROCESSING
        if not running:
            _remove_tree(job.dir)
        return True

    def discard_input(self, job: Job) -> None:
        """Delete the uploaded source file. Called as soon as processing is over."""
        if job.input_path is not None:
            try:
                job.input_path.unlink(missing_ok=True)
            except OSError:
                logger.warning("could not remove input for job %s", job.id)

    def finalize_cancelled(self, job: Job) -> None:
        """Called by a worker that noticed its job was deleted mid-run."""
        _remove_tree(job.dir)

    def sweep(self) -> int:
        """Delete finished jobs older than the TTL. Returns how many were removed."""
        now = self._clock()
        with self._lock:
            expired = [
                j for j in self._jobs.values() if j.finished_at is not None and now - j.finished_at >= self._ttl
            ]
            for job in expired:
                self._jobs.pop(job.id, None)
                job.cancelled = True
        for job in expired:
            _remove_tree(job.dir)
        return len(expired)

    def purge_orphans(self) -> int:
        """Remove job directories left behind by a previous run. Call once at startup."""
        removed = 0
        with self._lock:
            known = set(self._jobs)
        for entry in self._work_dir.iterdir():
            if entry.is_dir() and not entry.is_symlink() and JOB_ID_RE.match(entry.name) and entry.name not in known:
                _remove_tree(entry)
                removed += 1
        return removed
