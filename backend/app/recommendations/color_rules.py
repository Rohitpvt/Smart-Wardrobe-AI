"""
Color Compatibility Rules for Outfit Recommendations.

This module defines a deterministic color-matching matrix based on
established fashion pairing principles. It supports fuzzy/case-insensitive
matching and handles alias colors (e.g., "Navy" ↔ "Blue", "Cream" ↔ "Beige").
"""

from typing import List, Optional

# ─── Canonical Color Matrix ───────────────────────────────────────────
# Each key maps to a list of colors that pair well with it.
# All values are stored in title-case for consistency.
COLOR_COMPATIBILITY: dict[str, list[str]] = {
    "Green":  ["Beige", "Black", "White", "Navy", "Denim Blue"],
    "Red":    ["Black", "White", "Beige", "Denim Blue"],
    "Blue":   ["White", "Grey", "Beige", "Black"],
    "Black":  ["White", "Grey", "Beige", "Red", "Blue", "Green", "Pink"],
    "White":  ["Black", "Blue", "Beige", "Green", "Red", "Brown"],
    "Beige":  ["White", "Olive", "Brown", "Navy", "Black"],
    "Pink":   ["White", "Denim Blue", "Beige", "Grey"],
    "Yellow": ["White", "Denim Blue", "Black", "Beige"],
    "Brown":  ["Cream", "Beige", "Olive", "White", "Black"],
    "Grey":   ["Black", "White", "Blue", "Pink", "Navy"],
    "Navy":   ["White", "Beige", "Grey", "Pink", "Yellow"],
    "Cream":  ["Brown", "Beige", "Olive", "Navy", "Black"],
    "Olive":  ["White", "Beige", "Brown", "Cream", "Black"],
    "Maroon": ["White", "Beige", "Grey", "Black", "Cream"],
    "Purple": ["White", "Grey", "Black", "Beige", "Pink"],
    "Orange": ["White", "Black", "Navy", "Beige", "Brown"],
}

# ─── Alias Map ────────────────────────────────────────────────────────
# Maps alternative names / fuzzy matches to canonical color names.
COLOR_ALIASES: dict[str, str] = {
    "gray":       "Grey",
    "grey":       "Grey",
    "denim blue": "Denim Blue",
    "denim":      "Denim Blue",
    "navy":       "Navy",
    "navy blue":  "Navy",
    "cream":      "Cream",
    "off-white":  "Cream",
    "off white":  "Cream",
    "olive":      "Olive",
    "olive green": "Olive",
    "maroon":     "Maroon",
    "wine":       "Maroon",
    "burgundy":   "Maroon",
    "tan":        "Beige",
    "khaki":      "Beige",
    "multicolor": "Multicolor",
}

# Colors considered "light" — used for weather rules
LIGHT_COLORS = {"White", "Cream", "Beige", "Yellow", "Pink", "Light Blue"}

# Colors considered "dark" — used for rainy-day pairing
DARK_COLORS = {"Black", "Navy", "Brown", "Maroon", "Olive", "Grey"}


def _normalize(color: str) -> str:
    """Normalize a color string to its canonical name."""
    if not color:
        return ""
    lowered = color.strip().lower()
    # Check alias map first
    if lowered in COLOR_ALIASES:
        return COLOR_ALIASES[lowered]
    # Otherwise title-case and return
    return color.strip().title()


def get_compatible_colors(color: str) -> List[str]:
    """
    Return a list of colors that pair well with the given color.
    Falls back to broad matching if the color isn't in the matrix.
    """
    canonical = _normalize(color)

    # Direct lookup
    if canonical in COLOR_COMPATIBILITY:
        return COLOR_COMPATIBILITY[canonical]

    # If the color is an alias target that's also a key, look it up
    for alias, target in COLOR_ALIASES.items():
        if target == canonical and target in COLOR_COMPATIBILITY:
            return COLOR_COMPATIBILITY[target]

    # "Multicolor" is a partial match to everything
    if canonical == "Multicolor":
        return list(COLOR_COMPATIBILITY.keys())

    # Fallback: return universally safe colors
    return ["Black", "White", "Grey", "Beige"]


def get_color_score(color_a: str, color_b: str) -> float:
    """
    Return a compatibility score between 0.0 and 1.0 for two colors.
    
    Scoring logic:
    - 1.0: color_b is in color_a's compatibility list
    - 0.7: color_b is a "related" alias of a compatible color
    - 0.5: one of the colors is Multicolor (partial match to anything)
    - 0.3: neither is explicitly compatible but both are neutrals
    - 0.0: no known compatibility
    """
    norm_a = _normalize(color_a)
    norm_b = _normalize(color_b)

    if not norm_a or not norm_b:
        return 0.3  # Can't score, return neutral

    # Multicolor is a partial match
    if norm_a == "Multicolor" or norm_b == "Multicolor":
        return 0.5

    # Direct compatibility check (bidirectional)
    compat_a = get_compatible_colors(color_a)
    compat_b = get_compatible_colors(color_b)

    if norm_b in compat_a or norm_a in compat_b:
        return 1.0

    # Check if color_b's canonical form relates to any alias of a compatible color
    for compat_color in compat_a:
        alias_canonical = _normalize(compat_color)
        if alias_canonical == norm_b:
            return 0.7

    # Check reverse direction alias matching
    for compat_color in compat_b:
        alias_canonical = _normalize(compat_color)
        if alias_canonical == norm_a:
            return 0.7

    # Both are neutral tones — still somewhat safe
    neutrals = {"Black", "White", "Grey", "Beige", "Cream", "Navy"}
    if norm_a in neutrals and norm_b in neutrals:
        return 0.3

    return 0.0


def get_avoid_color_reason(color_a: str, color_b: str) -> Optional[str]:
    """
    Return a human-readable reason to avoid combining two colors,
    or None if the combination is acceptable.
    """
    score = get_color_score(color_a, color_b)
    if score >= 0.5:
        return None

    norm_a = _normalize(color_a)
    norm_b = _normalize(color_b)

    # Specific clash warnings
    clashes = {
        ("Red", "Green"): "Red and green together create a strong Christmas-themed color clash.",
        ("Green", "Red"): "Green and red together create a strong Christmas-themed color clash.",
        ("Red", "Orange"): "Red and orange are too close on the color wheel and can look jarring.",
        ("Orange", "Red"): "Red and orange are too close on the color wheel and can look jarring.",
        ("Pink", "Red"): "Pink and red can compete visually; consider a neutral separator.",
        ("Red", "Pink"): "Pink and red can compete visually; consider a neutral separator.",
    }

    key = (norm_a, norm_b)
    if key in clashes:
        return clashes[key]

    if score == 0.0:
        return f"Avoid pairing {norm_a} with {norm_b} — these colors don't complement each other well."

    return None
