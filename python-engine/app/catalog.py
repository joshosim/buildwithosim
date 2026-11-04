"""The separation models this engine offers, and what each can honestly produce.

Everything here is a claim the UI will repeat to a user, so it is limited to
what the Demucs project documents about these models:

* ``htdemucs`` separates a mix into drums, bass, other and vocals.
* ``htdemucs_ft`` is a fine-tuned variant: about 4x slower, might be a bit better.
* ``htdemucs_6s`` is experimental and adds guitar and piano. Guitar is okay;
  piano has a lot of bleed and artefacts.
* "Two stem" (karaoke) mode mixes the files after a full separation, so it is
  neither faster nor lighter than the 4-stem model.

"Other" is a catch-all, not an instrument. None of these models can isolate an
individual instrument inside it.
"""

from __future__ import annotations

from dataclasses import dataclass

STEM_LABELS: dict[str, str] = {
    "vocals": "Vocals",
    "accompaniment": "Accompaniment",
    "drums": "Drums",
    "bass": "Bass",
    "other": "Other",
    "guitar": "Guitar",
    "piano": "Piano",
}


def stem_kind(name: str) -> str:
    """Group used by the UI: ``vocals``, ``accompaniment`` or ``instrument``."""
    if name == "vocals":
        return "vocals"
    if name == "accompaniment":
        return "accompaniment"
    return "instrument"


@dataclass(frozen=True)
class ModelSpec:
    id: str
    demucs_name: str
    label: str
    description: str
    # What the network itself predicts, in Demucs' own naming.
    native_stems: tuple[str, ...]
    # Whether the individual non-vocal stems are returned, or only vocals plus
    # their sum (the accompaniment).
    returns_instrument_stems: bool
    relative_speed: str  # "baseline" | "slower"
    experimental: bool = False

    @property
    def output_stems(self) -> tuple[str, ...]:
        """Stems a finished job contains, in display order."""
        if not self.returns_instrument_stems:
            return ("vocals", "accompaniment")
        instruments = tuple(s for s in self.native_stems if s != "vocals")
        return ("vocals", "accompaniment", *instruments)


_FOUR_STEMS = ("drums", "bass", "other", "vocals")
_SIX_STEMS = ("drums", "bass", "other", "vocals", "guitar", "piano")

MODEL_CATALOG: tuple[ModelSpec, ...] = (
    ModelSpec(
        id="htdemucs_vocals",
        demucs_name="htdemucs",
        label="Vocals + accompaniment",
        description=(
            "A vocal stem and an accompaniment stem. It runs the same network as the "
            "4-stem option and mixes the result afterwards, so it is not faster."
        ),
        native_stems=_FOUR_STEMS,
        returns_instrument_stems=False,
        relative_speed="baseline",
    ),
    ModelSpec(
        id="htdemucs",
        demucs_name="htdemucs",
        label="4 stems",
        description=(
            "Vocals, drums, bass and other, plus an accompaniment mix. “Other” is "
            "everything not assigned to the first three (guitars, keys, synths and so on), "
            "not a single instrument."
        ),
        native_stems=_FOUR_STEMS,
        returns_instrument_stems=True,
        relative_speed="baseline",
    ),
    ModelSpec(
        id="htdemucs_ft",
        demucs_name="htdemucs_ft",
        label="4 stems, fine-tuned",
        description=(
            "A fine-tuned version of the 4-stem model. Takes about 4 times longer and "
            "might be a bit better."
        ),
        native_stems=_FOUR_STEMS,
        returns_instrument_stems=True,
        relative_speed="slower",
    ),
    ModelSpec(
        id="htdemucs_6s",
        demucs_name="htdemucs_6s",
        label="6 stems, experimental",
        description=(
            "Adds guitar and piano to the 4-stem set. Guitar is usable; piano often "
            "has a lot of bleed and artefacts."
        ),
        native_stems=_SIX_STEMS,
        returns_instrument_stems=True,
        relative_speed="baseline",
        experimental=True,
    ),
)

MODELS_BY_ID: dict[str, ModelSpec] = {m.id: m for m in MODEL_CATALOG}
DEFAULT_MODEL_ID = "htdemucs"
OUTPUT_FORMATS: tuple[str, ...] = ("wav", "mp3")
