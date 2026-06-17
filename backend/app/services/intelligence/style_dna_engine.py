import uuid
from typing import Dict, Any, List
from collections import Counter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.clothing_item import ClothingItem

class StyleDNAEngine:
    """
    Analyzes the wardrobe inventory to generate a persistent style profile.
    """
    
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(query)
        items = result.scalars().all()

        if not items:
            return self._empty_state()

        colors = [i.color.lower() for i in items if i.color]
        brands = [i.brand.strip() for i in items if i.brand and i.brand.strip()]
        categories = [i.category for i in items if i.category]
        
        # Heuristic determination of style
        dominant_style = "Minimalist"
        if len(set(colors)) > 10:
            dominant_style = "Eclectic"
        elif "Streetwear" in [i.clothing_type for i in items]:
            dominant_style = "Streetwear"
            
        color_affinities = [color for color, count in Counter(colors).most_common(3)]
        brand_patterns = [brand for brand, count in Counter(brands).most_common(3)]
        
        # Calculate consistency: high if few colors dominate
        color_counts = list(Counter(colors).values())
        if sum(color_counts) > 0 and len(color_counts) > 0:
            top_color_ratio = color_counts[0] / sum(color_counts)
            style_confidence = int(min(100, top_color_ratio * 150))
        else:
            style_confidence = 50

        return {
            "dominant_style": dominant_style,
            "secondary_styles": ["Casual", "Classic"] if dominant_style != "Casual" else ["Athleisure"],
            "color_affinities": color_affinities,
            "fit_preferences": ["Regular Fit", "Relaxed"],
            "brand_patterns": brand_patterns,
            "style_confidence": max(10, style_confidence)
        }

    def _empty_state(self) -> Dict[str, Any]:
        return {
            "dominant_style": "Undiscovered",
            "secondary_styles": [],
            "color_affinities": [],
            "fit_preferences": [],
            "brand_patterns": [],
            "style_confidence": 0
        }

style_dna_engine = StyleDNAEngine()
