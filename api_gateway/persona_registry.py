"""Shared persona definitions used by the API Gateway."""

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

DEFAULT_PERSONA_SCORES: dict[str, int] = {
    "practical": 35,
    "careful": 25,
    "value": 20,
    "trendsetter": 20,
}

PERSONA_SESSION_INTERESTS: dict[str, dict[str, int]] = {
    "trendsetter": {"Ladieswear": 8, "Menswear": 8, "Sport": 6},
    "practical": {"Menswear": 9, "Ladieswear": 7},
    "value": {"Divided": 9, "Ladieswear": 6, "Menswear": 6},
    "brand_loyal": {"Ladieswear": 9, "Menswear": 7, "Lingeries/Tights": 8},
    "impulse": {"Ladieswear": 8, "Menswear": 7, "Kids": 5},
    "careful": {"Menswear": 7, "Ladieswear": 7, "Sport": 6},
    "repeat_stable": {"Ladieswear": 9, "Menswear": 9},
    "color_focus": {"Ladieswear": 9, "Divided": 7},
    "category_focus": {"Ladieswear": 10, "Menswear": 8},
}

PERSONA_KEYWORD_RULES: dict[str, tuple[str, ...]] = {
    "value": ("가성비", "할인", "세일", "저렴", "가격", "budget", "cheap", "sale", "low"),
    "practical": ("실용", "기본", "출근", "편한", "활용", "minimal", "classic", "daily"),
    "careful": ("신중", "비교", "리뷰", "고민", "오래", "compare", "review"),
    "trendsetter": ("트렌드", "유행", "새로운", "힙", "street", "trend", "new"),
    "impulse": ("충동", "바로", "즉흥", "눈에 띄", "impulse"),
    "brand_loyal": ("브랜드", "brand", "익숙", "선호 브랜드"),
    "repeat_stable": ("반복", "재구매", "비슷한", "꾸준", "stable", "repeat"),
    "color_focus": ("색", "컬러", "검정", "블랙", "화이트", "파랑", "빨강", "color", "black", "white"),
    "category_focus": ("아우터", "자켓", "재킷", "니트", "셔츠", "원피스", "운동복", "outer", "jacket", "knit", "dress"),
}
