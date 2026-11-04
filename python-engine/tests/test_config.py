from __future__ import annotations

import pytest

from app.config import ConfigError, Settings


def test_defaults_are_sensible_and_local():
    settings = Settings.from_env({})
    assert settings.max_upload_mb == 150
    assert settings.max_duration_seconds == 600
    assert settings.job_ttl_seconds == 3600
    assert settings.device == "auto"
    assert settings.default_model == "htdemucs"
    assert settings.cors_origins == ("http://localhost:3000", "http://127.0.0.1:3000")
    assert "htdemucs_6s" in settings.enabled_models
    assert settings.max_upload_bytes == 150 * 1024 * 1024


def test_values_are_read_from_the_environment():
    settings = Settings.from_env(
        {
            "STEM_MAX_UPLOAD_MB": "20",
            "STEM_CORS_ORIGINS": "https://a.example, https://b.example ,",
            "STEM_DEVICE": "CPU",
            "STEM_ENABLED_MODELS": "htdemucs,htdemucs_ft",
            "STEM_DEFAULT_MODEL": "htdemucs_ft",
        }
    )
    assert settings.max_upload_mb == 20
    assert settings.cors_origins == ("https://a.example", "https://b.example")
    assert settings.device == "cpu"
    assert settings.enabled_models == ("htdemucs", "htdemucs_ft")
    assert settings.default_model == "htdemucs_ft"


def test_default_model_falls_back_to_the_first_enabled_one():
    assert Settings.from_env({"STEM_ENABLED_MODELS": "htdemucs_6s"}).default_model == "htdemucs_6s"


@pytest.mark.parametrize(
    ("env", "needle"),
    [
        ({"STEM_MAX_UPLOAD_MB": "lots"}, "STEM_MAX_UPLOAD_MB"),
        ({"STEM_MAX_UPLOAD_MB": "0"}, "STEM_MAX_UPLOAD_MB"),
        ({"STEM_JOB_TTL_SECONDS": "5"}, "STEM_JOB_TTL_SECONDS"),
        ({"STEM_DEVICE": "tpu"}, "STEM_DEVICE"),
        ({"STEM_ENABLED_MODELS": "htdemucs,mystery"}, "mystery"),
        ({"STEM_DEFAULT_MODEL": "htdemucs_6s", "STEM_ENABLED_MODELS": "htdemucs"}, "STEM_DEFAULT_MODEL"),
    ],
)
def test_bad_settings_fail_at_startup_naming_the_setting(env: dict[str, str], needle: str):
    with pytest.raises(ConfigError, match=needle):
        Settings.from_env(env)
