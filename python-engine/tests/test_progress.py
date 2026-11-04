from __future__ import annotations

import pytest

from app.progress import MAX_WHILE_RUNNING, fraction_complete


def end(offset: int, *, length: int = 1000, models: int = 1, model_idx: int = 0, shift_idx: int = 0) -> dict:
    return {
        "state": "end",
        "audio_length": length,
        "segment_offset": offset,
        "models": models,
        "model_idx_in_bag": model_idx,
        "shift_idx": shift_idx,
    }


def test_start_events_carry_no_progress():
    assert fraction_complete({**end(0), "state": "start"}, shifts=1, segment_frames=100) is None


@pytest.mark.parametrize("missing", ["audio_length", "segment_offset"])
def test_events_without_the_needed_fields_are_ignored(missing: str):
    event = end(0)
    del event[missing]
    assert fraction_complete(event, shifts=1, segment_frames=100) is None


def test_zero_length_audio_is_ignored():
    assert fraction_complete(end(0, length=0), shifts=1, segment_frames=100) is None


def test_single_model_reports_the_audio_position_reached():
    assert fraction_complete(end(0), shifts=1, segment_frames=100) == pytest.approx(0.1)
    assert fraction_complete(end(400), shifts=1, segment_frames=100) == pytest.approx(0.5)


def test_progress_is_held_below_one_until_the_job_completes():
    assert fraction_complete(end(950), shifts=1, segment_frames=100) == MAX_WHILE_RUNNING < 1.0


def test_bag_of_models_spreads_progress_across_models():
    # Third of four models, just starting: two models done plus a sliver.
    assert fraction_complete(end(0, models=4, model_idx=2), shifts=1, segment_frames=100) == pytest.approx(0.525)


def test_shifts_count_as_extra_passes():
    value = fraction_complete(end(400, shift_idx=1), shifts=2, segment_frames=100)
    assert value == pytest.approx((1 + 0.5) / 2)


def test_progress_rises_monotonically_across_a_whole_run():
    length, segment, stride = 10_000, 1_000, 750
    shifts, models = 2, 3
    values = []
    for model_idx in range(models):
        for shift_idx in range(shifts):
            for offset in range(0, length, stride):
                values.append(
                    fraction_complete(
                        end(offset, length=length, models=models, model_idx=model_idx, shift_idx=shift_idx),
                        shifts=shifts,
                        segment_frames=segment,
                    )
                )
    assert values == sorted(values)
    assert 0 < values[0] < 0.1
    assert values[-1] == MAX_WHILE_RUNNING
