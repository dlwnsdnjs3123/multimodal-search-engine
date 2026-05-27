from __future__ import annotations

import json
from pathlib import Path

from api_gateway.persona_registry import PERSONA_KEYS as API_PERSONA_KEYS
from api_gateway.persona_registry import PERSONA_SESSION_INTERESTS as API_PERSONA_SESSION_INTERESTS
from rec_models.common.personas import PERSONA_KEYS as REC_PERSONA_KEYS
from rec_models.common.personas import PERSONA_SESSION_INTERESTS as REC_PERSONA_SESSION_INTERESTS


def test_persona_keys_match_between_services_and_registry() -> None:
    registry = json.loads(Path("persona/persona_registry.json").read_text(encoding="utf-8"))
    registry_keys = tuple(persona["key"] for persona in registry["personas"])

    assert registry_keys == API_PERSONA_KEYS
    assert registry_keys == REC_PERSONA_KEYS


def test_persona_interest_mapping_matches_registry() -> None:
    registry = json.loads(Path("persona/persona_registry.json").read_text(encoding="utf-8"))
    registry_interest = {
        persona["key"]: persona["session_interest"]
        for persona in registry["personas"]
    }

    assert registry_interest == API_PERSONA_SESSION_INTERESTS
    assert registry_interest == {
        persona: {key: int(value) for key, value in interests.items()}
        for persona, interests in REC_PERSONA_SESSION_INTERESTS.items()
    }
