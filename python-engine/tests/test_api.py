"""API contract and job lifecycle, exercised with a fake separator (no PyTorch needed)."""

from __future__ import annotations

import io
import json
import re
import threading
import time
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.errors import SeparationError
from app.main import create_app
from conftest import CONTRACT_DIR, FakeSeparator, make_settings, make_wav_bytes, shape, upload, wait_for

JOB_ID = re.compile(r"^[0-9a-f]{32}$")


def contract(name: str) -> dict:
    return json.loads((CONTRACT_DIR / name).read_text())


def error_of(response) -> dict:
    body = response.json()
    assert set(body) == {"error"}, body
    assert set(body["error"]) == {"code", "message"}, body
    return body["error"]


# -- discovery ---------------------------------------------------------------


def test_health_reports_what_the_engine_depends_on(client: TestClient):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert set(body) == {"status", "ffmpeg", "demucs", "active_jobs"}
    assert body["active_jobs"] == 0


def test_models_matches_the_contract_example(client: TestClient):
    assert shape(client.get("/models").json()) == shape(contract("models.json"))


def test_models_describe_the_stems_each_model_really_returns(client: TestClient):
    body = client.get("/models").json()
    by_id = {m["id"]: m for m in body["models"]}

    assert body["default_model"] == "htdemucs"
    assert by_id["htdemucs_vocals"]["stems"] == ["vocals", "accompaniment"]
    assert by_id["htdemucs_vocals"]["returns_instrument_stems"] is False
    assert by_id["htdemucs"]["stems"] == ["vocals", "accompaniment", "drums", "bass", "other"]
    assert by_id["htdemucs_ft"]["relative_speed"] == "slower"
    assert by_id["htdemucs_6s"]["stems"][-2:] == ["guitar", "piano"]
    assert by_id["htdemucs_6s"]["experimental"] is True
    # No model claims instruments the network can't separate.
    assert all(s in m["native_stems"] or s == "accompaniment" for m in body["models"] for s in m["stems"])


def test_models_limits_come_from_settings(client: TestClient, settings):
    limits = client.get("/models").json()["limits"]
    assert limits["max_upload_mb"] == settings.max_upload_mb
    assert limits["max_duration_seconds"] == settings.max_duration_seconds
    assert ".mp3" in limits["allowed_extensions"]
    assert limits["output_formats"] == ["wav", "mp3"]


def test_only_enabled_models_are_listed_and_accepted(tmp_path: Path, separator: FakeSeparator):
    settings = make_settings(tmp_path, STEM_ENABLED_MODELS="htdemucs,htdemucs_vocals")
    with TestClient(create_app(settings, separator)) as client:
        assert [m["id"] for m in client.get("/models").json()["models"]] == ["htdemucs", "htdemucs_vocals"]
        rejected = upload(client, model="htdemucs_6s")
        assert rejected.status_code == 422
        assert error_of(rejected)["code"] == "unknown_model"


# -- happy path --------------------------------------------------------------


def test_upload_returns_a_job_that_completes_with_downloadable_stems(client: TestClient, separator: FakeSeparator):
    response = upload(client, model="htdemucs")

    assert response.status_code == 202
    job = response.json()
    assert JOB_ID.match(job["job_id"])
    assert response.headers["location"] == f"/jobs/{job['job_id']}"
    assert response.headers["cache-control"] == "no-store"
    assert job["status"] in {"queued", "processing", "completed"}
    assert job["stems"] is None or job["status"] == "completed"

    done = wait_for(client, job["job_id"])
    assert done["status"] == "completed"
    assert done["stage"] == "done"
    assert done["progress"] == 1.0
    assert done["error"] is None
    assert done["expires_at"] is not None
    assert [s["name"] for s in done["stems"]] == ["vocals", "accompaniment", "drums", "bass", "other"]
    assert [s["kind"] for s in done["stems"]] == ["vocals", "accompaniment", "instrument", "instrument", "instrument"]
    assert separator.calls == [{"model": "htdemucs", "format": "wav", "input_existed": True}]

    vocals = done["stems"][0]
    assert vocals["url"] == f"/jobs/{job['job_id']}/stems/vocals"
    assert vocals["download_url"] == f"/jobs/{job['job_id']}/stems/vocals?download=1"

    inline = client.get(vocals["url"])
    assert inline.status_code == 200
    assert inline.headers["content-type"] == "audio/wav"
    assert inline.headers["content-disposition"].startswith("inline")
    assert len(inline.content) == vocals["size_bytes"]

    attachment = client.get(vocals["download_url"])
    assert attachment.status_code == 200
    assert attachment.headers["content-disposition"].startswith("attachment")
    assert "song_vocals.wav" in attachment.headers["content-disposition"]


def test_vocals_only_model_returns_just_vocals_and_accompaniment(client: TestClient):
    job = upload(client, model="htdemucs_vocals").json()
    done = wait_for(client, job["job_id"])
    assert [s["name"] for s in done["stems"]] == ["vocals", "accompaniment"]


def test_default_model_and_format_apply_when_omitted(client: TestClient, separator: FakeSeparator):
    wait_for(client, upload(client).json()["job_id"])
    assert separator.calls[0]["model"] == "htdemucs"
    assert separator.calls[0]["format"] == "wav"


def test_mp3_output_is_served_with_the_right_media_type(client: TestClient):
    done = wait_for(client, upload(client, fmt="mp3").json()["job_id"])
    assert done["format"] == "mp3"
    assert {s["format"] for s in done["stems"]} == {"mp3"}
    assert client.get(done["stems"][0]["url"]).headers["content-type"] == "audio/mpeg"


def test_archive_contains_every_stem_with_readable_names(client: TestClient):
    done = wait_for(client, upload(client, filename="My Song (live).wav").json()["job_id"])
    archive = done["archive"]
    assert archive["download_url"] == f"/jobs/{done['job_id']}/archive"

    response = client.get(archive["download_url"])
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    assert response.headers["content-disposition"].startswith("attachment")
    assert len(response.content) == archive["size_bytes"]
    with zipfile.ZipFile(io.BytesIO(response.content)) as bundle:
        assert bundle.namelist() == [
            "My_Song_live_vocals.wav",
            "My_Song_live_accompaniment.wav",
            "My_Song_live_drums.wav",
            "My_Song_live_bass.wav",
            "My_Song_live_other.wav",
        ]
        assert bundle.testzip() is None


def test_client_supplied_path_components_never_reach_the_filesystem(client: TestClient, settings):
    done = wait_for(client, upload(client, filename="../../etc/pa ss.wav").json()["job_id"])
    assert done["filename"] == "pa ss.wav"
    assert "pa_ss_vocals.wav" in client.get(done["stems"][0]["download_url"]).headers["content-disposition"]
    assert not (settings.work_dir.parent / "etc").exists()


def test_stems_support_range_requests_so_players_can_seek(client: TestClient):
    done = wait_for(client, upload(client).json()["job_id"])
    response = client.get(done["stems"][0]["url"], headers={"Range": "bytes=0-9"})
    assert response.status_code == 206
    assert len(response.content) == 10
    assert response.headers["content-range"].startswith("bytes 0-9/")


def test_uploaded_source_is_deleted_once_processing_ends(client: TestClient, settings):
    done = wait_for(client, upload(client).json()["job_id"])
    leftovers = [p.name for p in (settings.work_dir / done["job_id"]).iterdir()]
    assert not any(name.startswith("input") for name in leftovers)
    assert "stems" in leftovers


# -- in-flight status --------------------------------------------------------


def test_a_running_job_reports_stage_and_real_progress_but_no_stems(client: TestClient, separator: FakeSeparator):
    separator.gate = threading.Event()
    job_id = upload(client).json()["job_id"]

    deadline = time.monotonic() + 5
    body = client.get(f"/jobs/{job_id}").json()
    while body["progress"] is None and time.monotonic() < deadline:
        time.sleep(0.02)
        body = client.get(f"/jobs/{job_id}").json()

    assert body["status"] == "processing"
    assert body["stage"] == "separating"
    assert body["progress"] == pytest.approx(0.4)
    assert body["stems"] is None and body["archive"] is None and body["expires_at"] is None
    assert shape(body) == shape(contract("job_processing.json"))

    # Stems and archive are not reachable before the job is finished.
    assert client.get(f"/jobs/{job_id}/stems/vocals").status_code == 404
    assert client.get(f"/jobs/{job_id}/archive").status_code == 404

    separator.gate.set()
    assert wait_for(client, job_id)["status"] == "completed"


def test_completed_job_matches_the_contract_example(client: TestClient):
    done = wait_for(client, upload(client).json()["job_id"])
    assert shape(done) == shape(contract("job_completed.json"))


# -- failures ----------------------------------------------------------------


def test_explained_failures_reach_the_client_and_leave_no_audio_behind(
    client: TestClient, separator: FakeSeparator, settings
):
    separator.fail_with = SeparationError(
        "out_of_memory", "The engine ran out of memory on this track. Try a shorter file, or a smaller model."
    )
    failed = wait_for(client, upload(client).json()["job_id"])

    assert failed["status"] == "failed"
    assert failed["error"] == {"code": "out_of_memory", "message": separator.fail_with.message}
    assert failed["stems"] is None and failed["archive"] is None and failed["progress"] is None
    assert shape(failed) == shape(contract("job_failed.json"))
    leftovers = [p.name for p in (settings.work_dir / failed["job_id"]).iterdir()]
    assert leftovers == []


def test_unexpected_failures_do_not_leak_internals(client: TestClient, separator: FakeSeparator):
    separator.fail_with = RuntimeError("secret internal detail /home/someone/model.pt")
    failed = wait_for(client, upload(client).json()["job_id"])

    assert failed["status"] == "failed"
    assert failed["error"]["code"] == "separation_failed"
    assert "secret" not in json.dumps(failed)


# -- upload validation -------------------------------------------------------


def test_unknown_model_is_rejected(client: TestClient):
    response = upload(client, model="not-a-model")
    assert response.status_code == 422
    assert error_of(response)["code"] == "unknown_model"


def test_unknown_output_format_is_rejected(client: TestClient):
    response = upload(client, fmt="ogg")
    assert response.status_code == 422
    assert error_of(response)["code"] == "unknown_format"


def test_unsupported_extension_is_rejected_with_the_allowed_list(client: TestClient):
    response = upload(client, filename="notes.txt")
    assert response.status_code == 415
    error = error_of(response)
    assert error["code"] == "unsupported_type"
    assert "MP3" in error["message"]


def test_missing_file_is_a_clear_error(client: TestClient):
    response = client.post("/jobs", data={"model": "htdemucs"})
    assert response.status_code == 422
    error = error_of(response)
    assert error["code"] == "invalid_request"
    assert "file" in error["message"].lower()


def test_empty_file_is_rejected(client: TestClient):
    response = upload(client, data=b"")
    assert response.status_code == 400
    assert error_of(response)["code"] == "empty_file"


def test_a_non_audio_file_with_an_audio_extension_is_rejected(client: TestClient):
    response = upload(client, data=b"#EXTM3U\n#EXT-X-VERSION:3\nhttp://169.254.169.254/\n", filename="trick.mp3")
    assert response.status_code == 422
    assert error_of(response)["code"] == "unrecognized_audio"


def test_a_corrupt_audio_container_is_rejected(client: TestClient):
    response = upload(client, data=b"RIFF\x00\x00\x00\x00WAVE" + b"junk" * 100)
    assert response.status_code == 422
    assert error_of(response)["code"] in {"unreadable_audio", "no_audio_stream", "duration_unknown"}


def test_tracks_over_the_length_limit_are_rejected(client: TestClient):
    response = upload(client, data=make_wav_bytes(seconds=40))  # limit is 30s in tests
    assert response.status_code == 422
    error = error_of(response)
    assert error["code"] == "too_long"
    assert "0:40" in error["message"] and "0:30" in error["message"]


def test_oversized_uploads_are_rejected_before_being_read(client: TestClient):
    response = upload(client, data=make_wav_bytes() + b"\0" * 1_300_000)  # limit is 1 MB in tests
    assert response.status_code == 413
    assert error_of(response)["code"] == "file_too_large"


def test_files_just_over_the_limit_are_rejected_by_the_handler(client: TestClient, settings):
    # Small enough to slip past the body-size guard (which allows multipart overhead).
    payload = make_wav_bytes(0.1) + b"\0" * (settings.max_upload_bytes + 1_000)
    response = upload(client, data=payload)
    assert response.status_code == 413
    assert error_of(response)["code"] == "file_too_large"
    # And nothing is left behind.
    assert [p for p in settings.work_dir.iterdir()] == []


def test_rejected_uploads_leave_no_job_directories(client: TestClient, settings):
    upload(client, filename="notes.txt")
    upload(client, data=b"")
    upload(client, data=b"not audio", filename="x.wav")
    assert list(settings.work_dir.iterdir()) == []
    assert client.get("/health").json()["active_jobs"] == 0


def test_a_full_queue_returns_busy(tmp_path: Path, separator: FakeSeparator):
    settings = make_settings(tmp_path, STEM_MAX_QUEUE="1")
    separator.gate = threading.Event()
    with TestClient(create_app(settings, separator)) as client:
        first = upload(client)
        assert first.status_code == 202
        second = upload(client)
        assert second.status_code == 429
        assert error_of(second)["code"] == "busy"
        separator.gate.set()
        wait_for(client, first.json()["job_id"])


# -- lookup, deletion, safety ------------------------------------------------


def test_unknown_and_malformed_job_ids_are_404s_with_the_standard_error_shape(client: TestClient):
    for job_id in ("0" * 32, "not-a-job", "..", "%2e%2e"):
        response = client.get(f"/jobs/{job_id}")
        assert response.status_code == 404, job_id
        assert error_of(response)["code"] in {"job_not_found", "not_found"}


def test_stem_names_are_looked_up_not_used_as_paths(client: TestClient):
    done = wait_for(client, upload(client).json()["job_id"])
    for stem in ("nope", "..%2f..%2fetc%2fpasswd", "vocals.wav", "VOCALS", "stems.zip"):
        response = client.get(f"/jobs/{done['job_id']}/stems/{stem}")
        assert response.status_code == 404, stem


def test_deleting_a_finished_job_removes_it_and_its_files(client: TestClient, settings):
    done = wait_for(client, upload(client).json()["job_id"])
    job_dir = settings.work_dir / done["job_id"]
    assert job_dir.exists()

    assert client.delete(f"/jobs/{done['job_id']}").status_code == 204
    assert not job_dir.exists()
    assert client.get(f"/jobs/{done['job_id']}").status_code == 404
    assert client.get(done["stems"][0]["url"]).status_code == 404
    assert client.delete(f"/jobs/{done['job_id']}").status_code == 404


def test_deleting_a_running_job_stops_it_and_cleans_up(client: TestClient, separator: FakeSeparator, settings):
    separator.gate = threading.Event()  # never released: cancellation is what ends this run
    job_id = upload(client).json()["job_id"]
    assert separator.started.wait(2)

    assert client.delete(f"/jobs/{job_id}").status_code == 204
    assert client.get(f"/jobs/{job_id}").status_code == 404

    deadline = time.monotonic() + 3
    while (settings.work_dir / job_id).exists() and time.monotonic() < deadline:
        time.sleep(0.02)
    assert not (settings.work_dir / job_id).exists()


def test_a_job_deleted_while_queued_is_never_run(tmp_path: Path, separator: FakeSeparator):
    settings = make_settings(tmp_path, STEM_MAX_QUEUE="4")
    separator.gate = threading.Event()
    with TestClient(create_app(settings, separator)) as client:
        first = upload(client).json()["job_id"]
        assert separator.started.wait(2)
        second = upload(client).json()["job_id"]
        assert client.delete(f"/jobs/{second}").status_code == 204

        separator.gate.set()
        wait_for(client, first)
        time.sleep(0.2)
        assert len(separator.calls) == 1
        assert not (settings.work_dir / second).exists()


def test_startup_removes_job_directories_left_by_a_previous_run(tmp_path: Path, separator: FakeSeparator):
    settings = make_settings(tmp_path)
    leftover = settings.work_dir / ("ab" * 16)
    leftover.mkdir(parents=True)
    (leftover / "input.wav").write_bytes(b"old upload")
    bystander = settings.work_dir / "my-other-stuff"
    bystander.mkdir()

    with TestClient(create_app(settings, separator)):
        assert not leftover.exists()
        assert bystander.exists()  # only job-id-named directories are ever touched


# -- CORS --------------------------------------------------------------------


def test_cors_allows_the_configured_origin_only(client: TestClient):
    preflight = {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    allowed = client.options("/jobs", headers={"Origin": "http://localhost:3000", **preflight})
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"

    denied = client.options("/jobs", headers={"Origin": "https://evil.example", **preflight})
    assert "access-control-allow-origin" not in denied.headers

    simple = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert simple.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_rejections_from_the_size_guard_still_carry_cors_headers(client: TestClient):
    response = upload(
        client,
        data=make_wav_bytes() + b"\0" * 1_300_000,
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 413
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
