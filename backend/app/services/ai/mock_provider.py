"""
Smart Wardrobe AI — Mock AI Provider

Returns realistic-looking mock data for development and testing.
This is the default provider used during Phase 1 before real AI
backends are integrated.
"""

import random
from typing import Any, Dict, List

from app.services.ai.base import AIProvider, ClothingAnalysis, OutfitRecommendation


class MockAIProvider(AIProvider):
    """
    Mock AI provider that returns predefined/randomized results.
    Useful for frontend development, testing, and demo purposes.
    """

    # Mock data pools for realistic responses
    CATEGORIES = {
        "top": ["t-shirt", "shirt", "blouse", "sweater", "hoodie", "jacket", "blazer"],
        "bottom": ["jeans", "trousers", "shorts", "skirt", "chinos", "joggers"],
        "shoes": ["sneakers", "boots", "loafers", "sandals", "heels", "flats"],
        "accessory": ["watch", "belt", "scarf", "hat", "sunglasses", "bag"],
        "outerwear": ["coat", "parka", "windbreaker", "vest", "cardigan"],
    }

    COLORS = [
        "black", "white", "navy blue", "charcoal gray", "olive green",
        "burgundy", "cream", "tan", "forest green", "slate blue",
    ]

    PATTERNS = ["solid", "striped", "plaid", "floral", "geometric", "checkered"]
    MATERIALS = ["cotton", "polyester", "denim", "wool", "linen", "silk", "leather"]
    SEASONS = ["spring", "summer", "fall", "winter"]
    OCCASIONS = ["casual", "formal", "business", "sport", "party", "outdoor"]

    async def analyze_clothing(
        self, image_bytes: bytes, mime_type: str = "image/jpeg"
    ) -> ClothingAnalysis:
        """Return mock clothing analysis."""
        category = random.choice(list(self.CATEGORIES.keys()))
        sub_category = random.choice(self.CATEGORIES[category])
        primary_color = random.choice(self.COLORS)
        secondary_color = random.choice(
            [c for c in self.COLORS if c != primary_color]
        )

        return ClothingAnalysis(
            category=category,
            sub_category=sub_category,
            color_primary=primary_color,
            color_secondary=secondary_color if random.random() > 0.5 else None,
            pattern=random.choice(self.PATTERNS),
            material=random.choice(self.MATERIALS),
            season=random.sample(self.SEASONS, k=random.randint(1, 3)),
            occasion=random.sample(self.OCCASIONS, k=random.randint(1, 3)),
            confidence=round(random.uniform(0.7, 0.98), 2),
            tags={
                "provider": "mock",
                "note": "This is mock data for development purposes.",
            },
        )

    async def recommend_outfit(
        self,
        wardrobe: List[Dict[str, Any]],
        context: Dict[str, Any],
    ) -> OutfitRecommendation:
        """Return a mock outfit recommendation."""
        # Pick random items from wardrobe if available, otherwise use mock IDs
        if wardrobe:
            selected = random.sample(
                wardrobe, k=min(random.randint(2, 4), len(wardrobe))
            )
            item_ids = [str(item.get("id", "mock-id")) for item in selected]
        else:
            item_ids = [f"mock-item-{i}" for i in range(3)]

        occasion = context.get("occasion", random.choice(self.OCCASIONS))

        return OutfitRecommendation(
            clothing_item_ids=item_ids,
            outfit_name=f"Smart {occasion.title()} Look",
            occasion=occasion,
            reasoning=(
                f"This outfit is perfect for a {occasion} setting. "
                f"The color palette creates a cohesive look, and the "
                f"materials are appropriate for the current weather conditions. "
                f"[Mock AI reasoning — real AI will provide detailed analysis]"
            ),
            style_score=round(random.uniform(0.7, 0.95), 2),
            weather_appropriate=True,
            color_harmony_score=round(random.uniform(0.6, 0.95), 2),
        )

    async def describe_outfit(
        self, items: List[Dict[str, Any]]
    ) -> str:
        """Return a mock outfit description."""
        if not items:
            return "No items provided for outfit description. [Mock provider]"

        item_names = [
            item.get("name", item.get("sub_category", "clothing item"))
            for item in items
        ]

        return (
            f"A stylish outfit featuring {', '.join(item_names[:-1])}"
            f"{' and ' + item_names[-1] if len(item_names) > 1 else item_names[0]}. "
            f"This combination creates a polished, put-together look "
            f"suitable for multiple occasions. [Mock AI description]"
        )
