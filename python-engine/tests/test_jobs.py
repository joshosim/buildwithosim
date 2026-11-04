"""The job registry: transitions, expiry and the safety of directory cleanup."""

from __future__ import annotations

import os
from pathlib import Path

from app.jobs import JobStore


class Clock:
    def __init__(self, now: float = 1_000.0) -> None:
        self.now = now

    def __call__(self) -> float:
        return self.now


def make_store(tmp_path: Path, ttl: int = 60) -> tuple[JobStore, Clock]:
    clock = Clock()
    return JobStore(tmp_path / "work", ttl_seconds=ttl, clock=clock), clock


def test_progress_never_goes_backwards_and_resets_when_the_stage_changes(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)

    store.report(job, "separating", 0.5)
    store.report(job, "separating", 0.3)
    assert store.view(job.id).progress == 0.5

    store.report(job, "encoding", None)
    view = store.view(job.id)
    assert (view.stage, view.progress) == ("encoding", None)


def test_progress_is_clamped_to_a_valid_fraction(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)
    store.report(job, "separating", 7.0)
    assert store.view(job.id).progress == 1.0


def test_reports_after_a_job_has_finished_are_ignored(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)
    store.fail(job, "x", "failed")
    store.report(job, "separating", 0.9)
    assert store.view(job.id).progress is None


def test_expiry_is_reported_as_finish_time_plus_ttl(tmp_path: Path):
    store, clock = make_store(tmp_path, ttl=120)
    job = store.create("a.wav", "htdemucs", "wav")
    assert store.view(job.id).expires_at is None
    store.mark_processing(job)
    store.complete(job, [], None, None)
    assert store.view(job.id).expires_at == clock.now + 120


def test_sweep_removes_only_finished_jobs_past_their_ttl(tmp_path: Path):
    store, clock = make_store(tmp_path, ttl=60)

    finished = store.create("a.wav", "htdemucs", "wav")
    (finished.dir / "stems.zip").write_bytes(b"zip")
    store.mark_processing(finished)
    store.complete(finished, [], None, None)

    running = store.create("b.wav", "htdemucs", "wav")
    store.mark_processing(running)

    clock.now += 59
    assert store.sweep() == 0
    assert finished.dir.exists()

    clock.now += 2
    assert store.sweep() == 1
    assert not finished.dir.exists()
    assert store.get(finished.id) is None
    assert running.dir.exists() and store.get(running.id) is not None


def test_failed_jobs_expire_too(tmp_path: Path):
    store, clock = make_store(tmp_path, ttl=60)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)
    store.fail(job, "x", "failed")
    clock.now += 61
    assert store.sweep() == 1
    assert not job.dir.exists()


def test_deleting_a_waiting_job_removes_its_directory_at_once(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    assert store.delete(job.id) is True
    assert not job.dir.exists()
    assert job.cancelled is True
    assert store.mark_processing(job) is False  # a worker picking it up later must skip it


def test_deleting_a_running_job_leaves_cleanup_to_its_worker(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)

    assert store.delete(job.id) is True
    assert job.dir.exists()  # the worker is still writing into it
    assert store.view(job.id) is None

    store.finalize_cancelled(job)
    assert not job.dir.exists()


def test_a_cancelled_job_cannot_be_completed_or_failed(tmp_path: Path):
    store, _ = make_store(tmp_path)
    job = store.create("a.wav", "htdemucs", "wav")
    store.mark_processing(job)
    store.delete(job.id)
    store.complete(job, [], None, None)
    store.fail(job, "x", "y")
    assert job.status == "processing"


def test_purge_orphans_only_touches_job_id_directories(tmp_path: Path):
    store, _ = make_store(tmp_path)
    work = tmp_path / "work"

    orphan = work / ("0f" * 16)
    orphan.mkdir()
    (orphan / "input.mp3").write_bytes(b"leftover")
    (work / "keep-me").mkdir()
    (work / "notes.txt").write_text("hands off")

    precious = tmp_path / "precious"
    precious.mkdir()
    (precious / "important.txt").write_text("do not delete")
    link = work / ("1e" * 16)
    os.symlink(precious, link)

    assert store.purge_orphans() == 1
    assert not orphan.exists()
    assert (work / "keep-me").exists() and (work / "notes.txt").exists()
    assert (precious / "important.txt").exists()
    assert link.is_symlink()


def test_invalid_job_ids_never_resolve(tmp_path: Path):
    store, _ = make_store(tmp_path)
    for bad in ("", "..", "../x", "A" * 32, "g" * 32, "0" * 31):
        assert store.get(bad) is None
        assert store.view(bad) is None
        assert store.delete(bad) is False
