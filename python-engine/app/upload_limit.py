"""Stop oversized uploads before they are written to disk.

FastAPI parses a multipart body (spooling the file to a temp file) before a
route handler runs, so a size check inside the handler comes too late to
protect the disk. This ASGI middleware counts request-body bytes as they
arrive on ``POST <path>``, whether or not the client declared a length, and
answers 413 as soon as the limit is crossed.

When a body is rejected mid-stream the client may see the connection close
before it has finished sending. The web client checks size up front, so this
is a backstop rather than the normal path.
"""

from __future__ import annotations

import json

from starlette.types import ASGIApp, Message, Receive, Scope, Send


class UploadSizeLimitMiddleware:
    def __init__(self, app: ASGIApp, *, path: str, max_bytes: int, message: str) -> None:
        self.app = app
        self.path = path
        self.max_bytes = max_bytes
        self.body = json.dumps({"error": {"code": "file_too_large", "message": message}}).encode()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] != self.path:
            await self.app(scope, receive, send)
            return

        declared = self._declared_length(scope)
        if declared is not None and declared > self.max_bytes:
            await self._reject(send)
            return

        received = 0
        rejected = False

        async def limited_receive() -> Message:
            nonlocal received, rejected
            if rejected:
                return {"type": "http.disconnect"}
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    rejected = True
                    await self._reject(send)
                    return {"type": "http.disconnect"}
            return message

        async def guarded_send(message: Message) -> None:
            if rejected:
                return  # we already answered; drop whatever the app tries to say next
            await send(message)

        await self.app(scope, limited_receive, guarded_send)

    @staticmethod
    def _declared_length(scope: Scope) -> int | None:
        for name, value in scope["headers"]:
            if name == b"content-length":
                try:
                    return int(value)
                except ValueError:
                    return None
        return None

    async def _reject(self, send: Send) -> None:
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(self.body)).encode()),
                    (b"connection", b"close"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": self.body})
