"""Shared runtime mode helpers for data pipeline scripts."""

from __future__ import annotations

import os
from collections.abc import Mapping
from typing import Any


DEFAULT_MODE = "test"
SUPPORTED_MODES = ("test", "dev", "production")


def normalize_runtime_mode(raw_mode: str | None, *, default_mode: str = DEFAULT_MODE) -> str:
    mode = (raw_mode or default_mode).strip().lower()
    if mode == "prod":
        mode = "production"
    return mode


def resolve_runtime_mode(
    mode_config: Mapping[str, Any],
    *,
    default_mode: str = DEFAULT_MODE,
    env_var: str = "DATA_PIPELINE_MODE",
) -> str:
    mode = normalize_runtime_mode(os.getenv(env_var), default_mode=default_mode)
    if mode not in mode_config:
        supported = ", ".join(mode_config.keys())
        raise ValueError(f"Unsupported {env_var}: {mode}. Supported modes: {supported}")
    return mode


def select_mode_config(
    mode_config: Mapping[str, dict[str, Any]],
    *,
    default_mode: str = DEFAULT_MODE,
    env_var: str = "DATA_PIPELINE_MODE",
) -> tuple[str, dict[str, Any]]:
    mode = resolve_runtime_mode(mode_config, default_mode=default_mode, env_var=env_var)
    return mode, dict(mode_config[mode])


def mode_suffix(mode: str) -> str:
    normalized_mode = normalize_runtime_mode(mode)
    if normalized_mode == "production":
        return ""
    if normalized_mode in {"test", "dev"}:
        return f"_{normalized_mode}"
    raise ValueError(f"Unsupported mode: {mode}")
