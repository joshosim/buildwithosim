"""Exceptions shared across the engine.

User-facing messages live here and in the code that raises them. Nothing from
an underlying library's exception text is ever sent to a client.
"""

from __future__ import annotations


class EngineHTTPError(Exception):
    """An error with a stable machine-readable ``code`` and a message safe to show a user."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


class SeparationError(Exception):
    """A separation failed in a way that can be explained to the user."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class SeparationCancelled(Exception):
    """The job was deleted while it was running; stop and clean up."""
