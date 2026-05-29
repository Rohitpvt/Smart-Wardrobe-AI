"""
Category Compatibility Rules for Outfit Recommendations.

Defines which clothing categories naturally pair together
to form complete, coherent outfits.
"""

from typing import List

# ─── Category Pairing Matrix ─────────────────────────────────────────
# Each category maps to a list of categories it pairs with.
CATEGORY_COMPATIBILITY: dict[str, list[str]] = {
    "Top Wear":     ["Bottom Wear", "Footwear", "Accessories"],
    "Bottom Wear":  ["Top Wear", "Footwear", "Accessories"],
    "Footwear":     ["Top Wear", "Bottom Wear", "Ethnic Wear", "Winter Wear", "Sportswear", "Formal Wear"],
    "Accessories":  ["Top Wear", "Bottom Wear", "Ethnic Wear", "Formal Wear"],
    "Ethnic Wear":  ["Ethnic Wear", "Footwear", "Accessories"],
    "Winter Wear":  ["Top Wear", "Bottom Wear", "Footwear", "Accessories"],
    "Sportswear":   ["Sportswear", "Footwear"],
    "Formal Wear":  ["Formal Wear", "Footwear", "Accessories"],
}

# ─── Type → Category Mapping ─────────────────────────────────────────
# Maps specific clothing types to their broader category for lookup.
TYPE_TO_CATEGORY: dict[str, str] = {
    "T-shirt":     "Top Wear",
    "Shirt":       "Top Wear",
    "Top":         "Top Wear",
    "Blouse":      "Top Wear",
    "Hoodie":      "Top Wear",
    "Sweater":     "Top Wear",
    "Kurta":       "Ethnic Wear",
    "Saree":       "Ethnic Wear",
    "Jeans":       "Bottom Wear",
    "Trousers":    "Bottom Wear",
    "Shorts":      "Bottom Wear",
    "Skirt":       "Bottom Wear",
    "Shoes":       "Footwear",
    "Sneakers":    "Footwear",
    "Heels":       "Footwear",
    "Sandals":     "Footwear",
    "Jacket":      "Winter Wear",
    "Coat":        "Winter Wear",
    "Accessories": "Accessories",
}

# ─── Outfit Slot Roles ────────────────────────────────────────────────
# Defines what "role" a category fills in an outfit.
CATEGORY_ROLE: dict[str, str] = {
    "Top Wear":    "top",
    "Bottom Wear": "bottom",
    "Footwear":    "footwear",
    "Accessories": "accessory",
    "Ethnic Wear": "top",       # Ethnic items often serve as the main piece
    "Winter Wear": "layering",
    "Sportswear":  "top",       # Could be top or bottom; default to top
    "Formal Wear": "top",       # Could be top or bottom; default to top
}


def get_compatible_categories(category: str) -> List[str]:
    """Return categories that pair well with the given category."""
    normalized = category.strip().title()
    return CATEGORY_COMPATIBILITY.get(normalized, [])


def get_outfit_role(category: str) -> str:
    """Return the outfit slot role for a category (top, bottom, footwear, accessory, layering)."""
    normalized = category.strip().title()
    return CATEGORY_ROLE.get(normalized, "other")


def infer_category_from_type(clothing_type: str) -> str:
    """Infer the broad category from a specific clothing type."""
    normalized = clothing_type.strip().title()
    return TYPE_TO_CATEGORY.get(normalized, "Top Wear")


def is_category_compatible(cat_a: str, cat_b: str) -> bool:
    """Check if two categories are compatible for an outfit."""
    compat = get_compatible_categories(cat_a)
    return cat_b.strip().title() in compat


def get_category_score(selected_category: str, candidate_category: str) -> float:
    """
    Return a compatibility score (0.0–1.0) between two categories.
    
    - 1.0: candidate is in selected's compatibility list
    - 0.5: candidate is in a "related" group (e.g., Formal Wear with Top Wear)
    - 0.0: no compatibility
    """
    if is_category_compatible(selected_category, candidate_category):
        return 1.0

    # Reverse check — if the candidate considers the selected compatible
    if is_category_compatible(candidate_category, selected_category):
        return 0.5

    return 0.0
