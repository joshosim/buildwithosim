"""
Experimental local voice-cloning adapter.

This uses Chatterbox Nano as an example model. It is an open-source research
model, not a hosted API. First model load downloads model weights and can take
time. CPU generation can also be slow.
"""
from pathlib import Path
from functools import lru_cache


@lru_cache(maxsize=1)
def load_model():
    # Lazy import means PDF extraction and /health still work without TTS installed.
    from chatterbox.tts_turbo import ChatterboxTurboTTS

    # Chatterbox Turbo 0.1.7 accepts only the device argument here. Its
    # generate() method accepts audio_prompt_path for reference voice cloning.
    return ChatterboxTurboTTS.from_pretrained(device="cpu")


def generate_wav(text: str, reference_audio: str, output_path: str) -> None:
    import torchaudio

    model = load_model()
    audio = model.generate(text, audio_prompt_path=reference_audio)
    torchaudio.save(str(Path(output_path)), audio, model.sr)
