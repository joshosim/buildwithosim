"""Turn Demucs' chunk callbacks into a completion fraction.

Demucs splits a track into overlapping segments and runs the network on each.
Its ``callback`` is invoked with ``state`` ``"start"`` and ``"end"`` around every
segment, together with the segment's frame offset and the track length. That is
real work completing, so a fraction derived from it is real progress.

It is still an estimate: segments overlap, the final segment is partial, and
the library does not report how many segments there will be. So the fraction
is the audio position reached by the segment that just finished, spread over
the models in the bag and the shifts, and the caller treats it as approximate
and never lets it run backwards. It reaches 1.0 only when the job completes.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

# Held just under 1.0 until the job actually completes.
MAX_WHILE_RUNNING = 0.99


def fraction_complete(event: Mapping[str, Any], *, shifts: int, segment_frames: int) -> float | None:
    """Return 0..1 for a finished-segment event, or ``None`` for anything else."""
    if event.get("state") != "end":
        return None

    length = event.get("audio_length")
    offset = event.get("segment_offset")
    if not isinstance(length, int | float) or length <= 0 or not isinstance(offset, int | float):
        return None

    models = max(1, int(event.get("models") or 1))
    model_idx = max(0, int(event.get("model_idx_in_bag") or 0))
    shift_idx = max(0, int(event.get("shift_idx") or 0))
    passes_per_model = max(1, shifts)

    within_pass = min(1.0, (offset + max(0, segment_frames)) / length)
    done = (model_idx * passes_per_model) + min(shift_idx, passes_per_model - 1) + within_pass
    total = models * passes_per_model
    return min(MAX_WHILE_RUNNING, done / total)
