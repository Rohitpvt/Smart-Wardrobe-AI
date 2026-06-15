"""
Style DNA Configuration.
Externalized classification matrix for style type inference.
Kept separate from service logic to enable future ML-based tuning
without refactoring business logic.
"""

from typing import Dict, List, NamedTuple


class StyleProfile(NamedTuple):
    style_type: str
    traits: List[str]


# Neutral color families used for classification
NEUTRAL_COLORS = frozenset({
    "black", "white", "grey", "gray", "navy", "beige", "cream",
    "charcoal", "ivory", "khaki", "tan", "taupe", "brown",
})

# Vibrant color families
VIBRANT_COLORS = frozenset({
    "red", "orange", "yellow", "pink", "magenta", "coral",
    "turquoise", "teal", "lime", "fuchsia", "gold",
})

# Earth tones
EARTH_COLORS = frozenset({
    "olive", "rust", "burgundy", "maroon", "forest green",
    "mustard", "terracotta", "sienna", "brown", "tan", "khaki",
})

# Formality signals by clothing type (lowercase)
FORMAL_TYPES = frozenset({
    "blazer", "suit", "dress shirt", "dress pants", "trousers",
    "oxford", "loafer", "derby", "tie", "dress",
})

CASUAL_TYPES = frozenset({
    "t-shirt", "tee", "hoodie", "jeans", "sneakers", "shorts",
    "sweatshirt", "joggers", "flip flops", "sandals", "cap",
})

# Classification matrix: (color_profile, formality_profile) → StyleProfile
# color_profile: "neutral" | "vibrant" | "earth" | "dark" | "mixed"
# formality_profile: "casual" | "formal" | "mixed"
STYLE_MATRIX: Dict[tuple, StyleProfile] = {
    ("neutral", "casual"): StyleProfile(
        "Smart Casual Minimalist",
        ["Clean neutral palette", "Relaxed yet polished", "Versatile basics"],
    ),
    ("neutral", "formal"): StyleProfile(
        "Corporate Minimalist",
        ["Understated elegance", "Monochrome precision", "Professional focus"],
    ),
    ("neutral", "mixed"): StyleProfile(
        "Modern Versatile",
        ["Adaptable wardrobe", "Neutral foundation", "Easy transitions"],
    ),
    ("vibrant", "casual"): StyleProfile(
        "Bold Casual",
        ["Expressive color choices", "Statement pieces", "Playful energy"],
    ),
    ("vibrant", "formal"): StyleProfile(
        "Power Dresser",
        ["Confident color use", "High-impact formal wear", "Attention-commanding"],
    ),
    ("vibrant", "mixed"): StyleProfile(
        "Eclectic Expressionist",
        ["Dynamic color range", "Mood-driven styling", "Creative combinations"],
    ),
    ("dark", "casual"): StyleProfile(
        "Urban Street",
        ["Dark-toned streetwear", "Edgy simplicity", "Night-ready aesthetic"],
    ),
    ("dark", "formal"): StyleProfile(
        "Dark Luxe",
        ["Sophisticated dark palette", "Refined edge", "Evening authority"],
    ),
    ("dark", "mixed"): StyleProfile(
        "Noir Versatile",
        ["Dark-first wardrobe", "Understated intensity", "Day-to-night ready"],
    ),
    ("earth", "casual"): StyleProfile(
        "Classic Heritage",
        ["Warm earth tones", "Timeless appeal", "Nature-inspired comfort"],
    ),
    ("earth", "formal"): StyleProfile(
        "Rustic Refined",
        ["Earthy sophistication", "Warm professional tones", "Grounded elegance"],
    ),
    ("earth", "mixed"): StyleProfile(
        "Organic Modern",
        ["Natural warmth", "Sustainable aesthetic", "Balanced earthiness"],
    ),
}

# Default fallback
DEFAULT_STYLE = StyleProfile(
    "Modern Versatile",
    ["Adaptable wardrobe", "Balanced composition", "Open to exploration"],
)
