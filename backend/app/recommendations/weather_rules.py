"""
Weather & Season Suitability Rules for Outfit Recommendations.

Maps weather conditions and seasons to preferred/avoided materials,
clothing types, and color preferences.
"""

from typing import List, Optional

# ─── Weather Profiles ─────────────────────────────────────────────────
# Each profile has preferred types, materials, and items to avoid.

WEATHER_PROFILES: dict[str, dict] = {
    "hot": {
        "prefer_materials": ["Cotton", "Linen", "Rayon"],
        "prefer_types":     ["T-shirt", "Shirt", "Top", "Shorts", "Sandals", "Sneakers"],
        "avoid_materials":  ["Wool", "Fleece", "Leather"],
        "avoid_types":      ["Coat", "Jacket", "Sweater", "Hoodie"],
        "prefer_light_colors": True,
    },
    "summer": {
        "prefer_materials": ["Cotton", "Linen", "Rayon"],
        "prefer_types":     ["T-shirt", "Shirt", "Top", "Shorts", "Sandals", "Sneakers"],
        "avoid_materials":  ["Wool", "Fleece", "Leather"],
        "avoid_types":      ["Coat", "Jacket", "Sweater", "Hoodie"],
        "prefer_light_colors": True,
    },
    "cold": {
        "prefer_materials": ["Wool", "Fleece", "Denim", "Leather"],
        "prefer_types":     ["Hoodie", "Jacket", "Coat", "Sweater", "Trousers", "Jeans", "Shoes"],
        "avoid_materials":  ["Linen"],
        "avoid_types":      ["Shorts", "Sandals"],
        "prefer_light_colors": False,
    },
    "winter": {
        "prefer_materials": ["Wool", "Fleece", "Denim", "Leather"],
        "prefer_types":     ["Hoodie", "Jacket", "Coat", "Sweater", "Trousers", "Jeans", "Shoes"],
        "avoid_materials":  ["Linen"],
        "avoid_types":      ["Shorts", "Sandals"],
        "prefer_light_colors": False,
    },
    "rainy": {
        "prefer_materials": ["Nylon", "Synthetic", "Polyester"],
        "prefer_types":     ["Sandals", "Sneakers", "T-shirt", "Shirt", "Jeans"],
        "avoid_materials":  ["Suede", "Leather", "Silk"],
        "avoid_types":      ["Heels"],
        "prefer_dark_colors": True,
        "avoid_white_footwear": True,
    },
    "monsoon": {
        "prefer_materials": ["Nylon", "Synthetic", "Polyester"],
        "prefer_types":     ["Sandals", "Sneakers", "T-shirt", "Shirt", "Jeans"],
        "avoid_materials":  ["Suede", "Leather", "Silk"],
        "avoid_types":      ["Heels"],
        "prefer_dark_colors": True,
        "avoid_white_footwear": True,
    },
    "humid": {
        "prefer_materials": ["Cotton", "Linen"],
        "prefer_types":     ["T-shirt", "Shirt", "Top", "Shorts", "Sandals"],
        "avoid_materials":  ["Synthetic", "Nylon", "Polyester"],
        "avoid_types":      ["Jacket", "Coat"],
        "prefer_light_colors": True,
        "prefer_loose_fit": True,
    },
    "mild": {
        "prefer_materials": [],
        "prefer_types":     [],
        "avoid_materials":  [],
        "avoid_types":      [],
    },
    "all-season": {
        "prefer_materials": [],
        "prefer_types":     [],
        "avoid_materials":  [],
        "avoid_types":      [],
    },
    "spring": {
        "prefer_materials": ["Cotton", "Linen", "Denim"],
        "prefer_types":     ["Shirt", "T-shirt", "Jeans", "Sneakers", "Top"],
        "avoid_materials":  ["Wool", "Fleece"],
        "avoid_types":      ["Coat"],
    },
    "autumn": {
        "prefer_materials": ["Denim", "Cotton", "Wool"],
        "prefer_types":     ["Jacket", "Jeans", "Shirt", "Sweater", "Shoes", "Sneakers"],
        "avoid_materials":  ["Linen"],
        "avoid_types":      ["Shorts", "Sandals"],
    },
}

# Light and dark color sets for weather-based filtering
LIGHT_COLORS = {"White", "Cream", "Beige", "Yellow", "Pink"}
DARK_COLORS = {"Black", "Navy", "Brown", "Maroon", "Olive", "Grey", "Dark Blue"}


def _normalize_weather(weather: str) -> str:
    """Normalize weather string to profile key."""
    return weather.strip().lower().replace("-", "").replace("_", "").replace(" ", "")


def get_weather_profile(weather: str) -> dict:
    """
    Return the weather profile dict for the given weather/season.
    Falls back to 'mild' if unrecognized.
    """
    normalized = _normalize_weather(weather)
    # Handle "allseason" normalization
    if normalized == "allseason":
        return WEATHER_PROFILES["all-season"]
    return WEATHER_PROFILES.get(normalized, WEATHER_PROFILES["mild"])


def get_weather_score(weather: str, item_type: str, item_material: Optional[str], item_color: Optional[str], item_category: Optional[str]) -> float:
    """
    Score an item's suitability for the given weather (0.0–1.0).
    
    Scoring breakdown:
    - 1.0: item type AND material are preferred
    - 0.8: item type is preferred
    - 0.7: item material is preferred
    - 0.5: item is neutral (not preferred, not avoided)
    - 0.2: item is in the avoid list (type or material)
    - 0.0: item is strongly unsuitable
    """
    profile = get_weather_profile(weather)
    if not profile.get("prefer_types") and not profile.get("avoid_types"):
        return 0.5  # Mild / all-season — everything is neutral

    normalized_type = (item_type or "").strip().title()
    normalized_material = (item_material or "").strip().title()
    normalized_color = (item_color or "").strip().title()

    score = 0.5  # Start neutral

    # Check preferred types
    if normalized_type in profile.get("prefer_types", []):
        score += 0.3

    # Check preferred materials
    if normalized_material in profile.get("prefer_materials", []):
        score += 0.2

    # Check avoided types
    if normalized_type in profile.get("avoid_types", []):
        score -= 0.3

    # Check avoided materials
    if normalized_material in profile.get("avoid_materials", []):
        score -= 0.2

    # Weather-specific color preferences
    if profile.get("prefer_light_colors") and normalized_color in LIGHT_COLORS:
        score += 0.1
    if profile.get("prefer_dark_colors") and normalized_color in DARK_COLORS:
        score += 0.1

    # Specific avoidance: white footwear in rain
    if profile.get("avoid_white_footwear"):
        is_footwear = (item_category or "").strip().title() == "Footwear" or normalized_type in ["Shoes", "Sneakers", "Heels", "Sandals"]
        if is_footwear and normalized_color == "White":
            score -= 0.3

    # Clamp between 0.0 and 1.0
    return max(0.0, min(1.0, score))


def get_weather_avoid_reasons(weather: str, item_type: str, item_material: Optional[str], item_color: Optional[str], item_category: Optional[str]) -> List[str]:
    """Return human-readable reasons why an item should be avoided for the given weather."""
    profile = get_weather_profile(weather)
    reasons = []

    normalized_type = (item_type or "").strip().title()
    normalized_material = (item_material or "").strip().title()
    normalized_color = (item_color or "").strip().title()

    if normalized_type in profile.get("avoid_types", []):
        reasons.append(f"Avoid wearing {normalized_type} in {weather.lower()} weather.")

    if normalized_material in profile.get("avoid_materials", []):
        reasons.append(f"Avoid {normalized_material} material in {weather.lower()} weather.")

    if profile.get("avoid_white_footwear"):
        is_footwear = (item_category or "").strip().title() == "Footwear" or normalized_type in ["Shoes", "Sneakers", "Heels", "Sandals"]
        if is_footwear and normalized_color == "White":
            reasons.append("Avoid white footwear during rainy weather — they stain easily.")

    return reasons
