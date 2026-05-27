from __future__ import annotations

import pytest

from data_pipeline.pipeline_config import mode_suffix, normalize_runtime_mode, select_mode_config


def test_normalize_runtime_mode_accepts_prod_alias() -> None:
    assert normalize_runtime_mode("prod") == "production"
    assert normalize_runtime_mode(None) == "test"


def test_select_mode_config_uses_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    mode_config = {"test": {"rows": 10}, "dev": {"rows": 100}}
    monkeypatch.setenv("DATA_PIPELINE_MODE", "dev")

    mode, config = select_mode_config(mode_config)

    assert mode == "dev"
    assert config == {"rows": 100}


def test_mode_suffix_matches_pipeline_file_naming() -> None:
    assert mode_suffix("test") == "_test"
    assert mode_suffix("dev") == "_dev"
    assert mode_suffix("production") == ""
