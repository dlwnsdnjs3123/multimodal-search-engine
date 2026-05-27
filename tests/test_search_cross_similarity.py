from __future__ import annotations

import numpy as np
import pytest

pytest.importorskip("transformers")
pytest.importorskip("torch")

from search_engine.search_engine import MultimodalSearchEngine, SearchItem


def _engine_with_vectors() -> MultimodalSearchEngine:
    engine = object.__new__(MultimodalSearchEngine)
    engine.items = [
        SearchItem("0000000001", "A", 0.0, "", None, None, {}),
        SearchItem("0000000002", "B", 0.0, "", None, None, {}),
        SearchItem("0000000003", "C", 0.0, "", None, None, {}),
    ]
    engine.item_ids = [item.product_id for item in engine.items]
    engine._embeddings = np.asarray(
        [
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 1.0],
        ],
        dtype=np.float32,
    )
    engine._text_embeddings = engine._embeddings.copy()
    engine._image_embeddings = engine._embeddings.copy()
    return engine


def test_cross_similarity_returns_pairwise_cosine_scores() -> None:
    engine = _engine_with_vectors()

    found_ids, missing_ids, similarity = engine.cross_similarity(
        ["1", "0000000002", "999"],
        modality="multimodal",
    )

    assert found_ids == ["0000000001", "0000000002"]
    assert missing_ids == ["0000000999"]
    assert similarity["0000000001"]["0000000002"] == 0.0
    assert similarity["0000000002"]["0000000001"] == 0.0
    assert "0000000001" not in similarity["0000000001"]


def test_cross_similarity_normalizes_vectors_before_scoring() -> None:
    engine = _engine_with_vectors()

    found_ids, _, similarity = engine.cross_similarity(["1", "3"])

    assert found_ids == ["0000000001", "0000000003"]
    assert similarity["0000000001"]["0000000003"] == 0.707107
