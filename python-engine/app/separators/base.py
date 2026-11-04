"""The seam between the HTTP layer and whatever actually separates audio.

The API and job machinery depend only on this protocol, which keeps the web
layer testable without PyTorch and leaves room for other engines.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from ..catalog import ModelSpec

# report(stage, progress): progress is a 0..1 fraction or None when unknown.
ProgressReporter = Callable[[str, float | None], None]


@dataclass(frozen=True)
class OutputStem:
    name: str
    path: Path


class Separator(Protocol):
    def separate(
        self,
        *,
        input_path: Path,
        spec: ModelSpec,
        output_dir: Path,
        output_format: str,
        report: ProgressReporter,
        is_cancelled: Callable[[], bool],
    ) -> list[OutputStem]:
        """Write one file per name in ``spec.output_stems`` into ``output_dir``.

        Must call ``report`` as it moves between stages, raise
        :class:`~app.errors.SeparationError` for failures that can be explained to
        a user, and raise :class:`~app.errors.SeparationCancelled` if
        ``is_cancelled()`` becomes true.
        """
        ...
