"""
Occasion Suitability Rules for Outfit Recommendations.

Maps occasions to suitable and unsuitable clothing types,
enabling occasion-aware outfit scoring.
"""

from typing import List, Optional

# ─── Occasion → Suitable Types Mapping ────────────────────────────────
OCCASION_TYPES: dict[str, list[str]] = {
    "casual": [
        "T-shirt", "Jeans", "Sneakers", "Shirt", "Hoodie",
        "Shorts", "Sandals", "Top", "Jacket",
    ],
    "formal": [
        "Shirt", "Trousers", "Blouse", "Heels", "Shoes",
        "Coat", "Skirt",
    ],
    "party": [
        "Top", "Skirt", "Jacket", "Heels", "Jeans",
        "Shirt", "Blouse", "Sneakers", "Accessories",
    ],
    "college": [
        "T-shirt", "Shirt", "Jeans", "Kurta", "Sneakers",
        "Hoodie", "Shorts", "Top", "Sandals",
    ],
    "office": [
        "Shirt", "Trousers", "Blouse", "Shoes", "Heels",
        "Skirt",
    ],
    "gym": [
        "T-shirt", "Shorts", "Sneakers", "Top",
    ],
    "wedding": [
        "Kurta", "Saree", "Heels", "Accessories", "Blouse",
    ],
    "ethnic function": [
        "Kurta", "Saree", "Heels", "Accessories", "Blouse",
    ],
    "travel": [
        "Jeans", "T-shirt", "Hoodie", "Sneakers", "Jacket",
        "Shorts", "Sandals", "Shirt",
    ],
    "daily wear": [
        "T-shirt", "Jeans", "Sneakers", "Shirt", "Shorts",
        "Sandals", "Top", "Hoodie",
    ],
}

# ─── Occasion → Unsuitable Types (explicit avoids) ───────────────────
OCCASION_AVOID: dict[str, list[str]] = {
    "formal":  ["T-shirt", "Hoodie", "Shorts", "Sandals", "Sneakers"],
    "gym":     ["Heels", "Shirt", "Trousers", "Saree", "Kurta", "Blouse", "Coat"],
    "wedding": ["T-shirt", "Hoodie", "Shorts", "Jeans", "Sneakers"],
    "ethnic function": ["T-shirt", "Hoodie", "Shorts", "Jeans", "Sneakers"],
    "office":  ["Hoodie", "Shorts", "Sandals"],
}

# ─── Occasion → Category Preference ──────────────────────────────────
OCCASION_CATEGORIES: dict[str, list[str]] = {
    "casual":          ["Top Wear", "Bottom Wear", "Footwear"],
    "formal":          ["Formal Wear", "Top Wear", "Bottom Wear", "Footwear"],
    "party":           ["Top Wear", "Bottom Wear", "Footwear", "Accessories"],
    "college":         ["Top Wear", "Bottom Wear", "Footwear", "Ethnic Wear"],
    "office":          ["Formal Wear", "Top Wear", "Bottom Wear", "Footwear"],
    "gym":             ["Sportswear", "Footwear"],
    "wedding":         ["Ethnic Wear", "Footwear", "Accessories"],
    "ethnic function": ["Ethnic Wear", "Footwear", "Accessories"],
    "travel":          ["Top Wear", "Bottom Wear", "Footwear", "Winter Wear"],
    "daily wear":      ["Top Wear", "Bottom Wear", "Footwear"],
}


def _normalize_occasion(occasion: str) -> str:
    """Normalize occasion string to lowercase key."""
    return occasion.strip().lower()


def get_occasion_suitable_types(occasion: str) -> List[str]:
    """Return clothing types suitable for the given occasion."""
    normalized = _normalize_occasion(occasion)
    return OCCASION_TYPES.get(normalized, [])


def get_occasion_avoid_types(occasion: str) -> List[str]:
    """Return clothing types to avoid for the given occasion."""
    normalized = _normalize_occasion(occasion)
    return OCCASION_AVOID.get(normalized, [])


def get_occasion_score(occasion: str, item_type: str, item_category: str) -> float:
    """
    Score an item's suitability for the given occasion (0.0–1.0).
    
    - 1.0: type is explicitly suitable
    - 0.7: category is suitable but type isn't explicitly listed
    - 0.3: neutral (occasion not specified or broad match)
    - 0.0: type is explicitly unsuitable
    """
    if not occasion:
        return 0.5  # No occasion filter — neutral

    normalized = _normalize_occasion(occasion)
    normalized_type = (item_type or "").strip().title()
    normalized_category = (item_category or "").strip().title()

    # Check explicit avoids first
    avoid_types = OCCASION_AVOID.get(normalized, [])
    if normalized_type in avoid_types:
        return 0.0

    # Check explicit suitability
    suitable_types = OCCASION_TYPES.get(normalized, [])
    if normalized_type in suitable_types:
        return 1.0

    # Check category-level suitability
    suitable_categories = OCCASION_CATEGORIES.get(normalized, [])
    if normalized_category in suitable_categories:
        return 0.7

    return 0.3  # Neutral


def get_occasion_tag(occasion: str) -> Optional[str]:
    """Return a tag label for the occasion (e.g., 'College Ready')."""
    tag_map = {
        "casual": "Casual Friendly",
        "formal": "Formal Ready",
        "party": "Party Ready",
        "college": "College Ready",
        "office": "Office Ready",
        "gym": "Gym Ready",
        "wedding": "Wedding Ready",
        "ethnic function": "Ethnic Ready",
        "travel": "Travel Friendly",
        "daily wear": "Daily Wear",
    }
    normalized = _normalize_occasion(occasion)
    return tag_map.get(normalized)
