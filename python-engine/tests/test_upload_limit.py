"""The body-size guard, driven directly at the ASGI level (no HTTP client, no framework)."""

from __future__ import annotations

import json

import pytest

from app.upload_limit import UploadSizeLimitMiddleware

LIMIT = 1_000


async def echo_length_app(scope, receive, send):
    """Reads the whole body, then answers 200 with how many bytes it saw."""
    total = 0
    while True:
        message = await receive()
        if message["type"] == "http.disconnect":
            break
        total += len(message.get("body", b""))
        if not message.get("more_body"):
            break
    await send({"type": "http.response.start", "status": 200, "headers": []})
    await send({"type": "http.response.body", "body": str(total).encode()})


async def run(chunks: list[bytes], *, method="POST", path="/jobs", content_length: int | None = None):
    app = UploadSizeLimitMiddleware(echo_length_app, path="/jobs", max_bytes=LIMIT, message="too big")
    headers = [] if content_length is None else [(b"content-length", str(content_length).encode())]
    scope = {"type": "http", "method": method, "path": path, "headers": headers}

    pending = [
        {"type": "http.request", "body": chunk, "more_body": index < len(chunks) - 1}
        for index, chunk in enumerate(chunks)
    ]

    async def receive():
        return pending.pop(0) if pending else {"type": "http.disconnect"}

    sent: list[dict] = []

    async def send(message):
        sent.append(message)

    await app(scope, receive, send)
    return sent


def status_of(sent: list[dict]) -> int:
    return next(m["status"] for m in sent if m["type"] == "http.response.start")


def body_of(sent: list[dict]) -> bytes:
    return b"".join(m.get("body", b"") for m in sent if m["type"] == "http.response.body")


@pytest.mark.anyio
async def test_declared_oversize_is_rejected_without_reading_anything():
    sent = await run([b"x" * 10], content_length=LIMIT + 1)
    assert status_of(sent) == 413
    assert json.loads(body_of(sent))["error"]["code"] == "file_too_large"


@pytest.mark.anyio
async def test_bodies_within_the_limit_pass_through_untouched():
    sent = await run([b"a" * 400, b"b" * 400], content_length=800)
    assert status_of(sent) == 200
    assert body_of(sent) == b"800"


@pytest.mark.anyio
async def test_an_undeclared_oversize_stream_is_cut_off_and_answered_exactly_once():
    # No Content-Length (chunked): the limit is enforced as bytes arrive.
    sent = await run([b"x" * 600, b"x" * 600, b"x" * 600])
    assert status_of(sent) == 413
    starts = [m for m in sent if m["type"] == "http.response.start"]
    assert len(starts) == 1  # the app's own late "200" was swallowed
    assert json.loads(body_of(sent))["error"]["code"] == "file_too_large"


@pytest.mark.anyio
async def test_a_lying_content_length_does_not_get_around_the_limit():
    sent = await run([b"x" * 600, b"x" * 600], content_length=100)
    assert status_of(sent) == 413


@pytest.mark.anyio
async def test_other_routes_and_methods_are_not_limited():
    assert status_of(await run([b"x" * 5_000], path="/other", content_length=5_000)) == 200
    assert status_of(await run([b"x" * 5_000], method="PUT", content_length=5_000)) == 200
