from __future__ import annotations

from pathlib import Path

import pytest

from app.audio_probe import ffmpeg_available, looks_like_audio_container, probe_audio
from app.errors import EngineHTTPError
from conftest import make_wav_bytes

needs_ffmpeg = pytest.mark.skipif(not ffmpeg_available(), reason="ffmpeg/ffprobe not installed")


@pytest.mark.parametrize(
    "head",
    [
        b"ID3\x04\x00\x00\x00\x00",
        b"\xff\xfb\x90\x00",
        b"\xff\xf1\x50\x80",
        b"RIFF\x24\x08\x00\x00WAVEfmt ",
        b"fLaC\x00\x00\x00\x22",
        b"OggS\x00\x02\x00\x00",
        b"FORM\x00\x00\x00\x00AIFF",
        b"FORM\x00\x00\x00\x00AIFC",
        b"\x00\x00\x00\x18ftypM4A ",
    ],
)
def test_real_audio_container_signatures_are_accepted(head: bytes):
    assert looks_like_audio_container(head)


@pytest.mark.parametrize(
    "head",
    [
        b"",
        b"abc",
        b"#EXTM3U\n#EXT-X-VERSION:3\n",  # HLS playlist: ffmpeg would fetch what it points at
        b"ffconcat version 1.0\nfile '/etc/passwd'\n",
        b"PK\x03\x04\x14\x00\x00\x00",
        b"\x89PNG\r\n\x1a\n",
        b"RIFF\x24\x08\x00\x00AVI LIST",
        b"<?xml version=\"1.0\"?>",
    ],
)
def test_other_content_is_refused_before_ffmpeg_sees_it(head: bytes):
    assert not looks_like_audio_container(head)


@needs_ffmpeg
def test_valid_audio_reports_its_duration(tmp_path: Path):
    path = tmp_path / "input.wav"
    path.write_bytes(make_wav_bytes(seconds=2.0))
    info = probe_audio(path)
    assert info.duration_seconds == pytest.approx(2.0, abs=0.05)
    assert info.codec == "pcm_s16le"


@needs_ffmpeg
def test_playlist_files_with_an_audio_extension_are_rejected(tmp_path: Path):
    path = tmp_path / "input.mp3"
    path.write_text("#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:10,\nhttp://127.0.0.1:1/x.ts\n")
    with pytest.raises(EngineHTTPError) as raised:
        probe_audio(path)
    assert raised.value.status_code == 422
    assert raised.value.code == "unrecognized_audio"


@needs_ffmpeg
def test_corrupt_audio_is_a_422_not_a_crash(tmp_path: Path):
    path = tmp_path / "input.wav"
    path.write_bytes(b"RIFF\x00\x00\x00\x00WAVE" + b"not really audio" * 50)
    with pytest.raises(EngineHTTPError) as raised:
        probe_audio(path)
    assert raised.value.status_code == 422
