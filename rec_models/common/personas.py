"""Shared recommendation persona definitions."""

from __future__ import annotations


PERSONA_KEYS = (
    "trendsetter",
    "practical",
    "value",
    "brand_loyal",
    "impulse",
    "careful",
    "repeat_stable",
    "color_focus",
    "category_focus",
)

PERSONA_SESSION_INTERESTS: dict[str, dict[str, float]] = {
    "trendsetter": {"Ladieswear": 8.0, "Menswear": 8.0, "Sport": 6.0},
    "practical": {"Menswear": 9.0, "Ladieswear": 7.0},
    "value": {"Divided": 9.0, "Ladieswear": 6.0, "Menswear": 6.0},
    "brand_loyal": {"Ladieswear": 9.0, "Menswear": 7.0, "Lingeries/Tights": 8.0},
    "impulse": {"Ladieswear": 8.0, "Menswear": 7.0, "Kids": 5.0},
    "careful": {"Menswear": 7.0, "Ladieswear": 7.0, "Sport": 6.0},
    "repeat_stable": {"Ladieswear": 9.0, "Menswear": 9.0},
    "color_focus": {"Ladieswear": 9.0, "Divided": 7.0},
    "category_focus": {"Ladieswear": 10.0, "Menswear": 8.0},
}
