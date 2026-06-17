import uuid
import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.clothing_item import ClothingItem

class SeasonalReadinessAnalyzer:
    """
    Analyzes wardrobe coverage for current or upcoming seasons.
    """
    
    # Simple configurable rules mapped to seasons
    SEASON_REQUIREMENTS = {
        "Summer": {"Topwear": 5, "Bottomwear": 3, "Footwear": 1},
        "Winter": {"Topwear": 3, "Outerwear": 2, "Bottomwear": 3},
        "Spring": {"Topwear": 4, "Bottomwear": 3, "Outerwear": 1},
        "Autumn": {"Topwear": 4, "Outerwear": 1, "Bottomwear": 3}
    }

    def _get_current_season(self) -> str:
        month = datetime.datetime.now().month
        if month in [12, 1, 2]: return "Winter"
        if month in [3, 4, 5]: return "Spring"
        if month in [6, 7, 8]: return "Summer"
        return "Autumn"

    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(query)
        items = result.scalars().all()

        if not items:
            return self._empty_state()

        current_season = self._get_current_season()
        season_reqs = self.SEASON_REQUIREMENTS.get(current_season, {})

        # Count items that match the current season (or have no season set but match category)
        season_items = [i for i in items if not i.season or i.season.lower() == current_season.lower() or i.season.lower() == "all season"]
        
        counts = {}
        for item in season_items:
            cat = item.category
            counts[cat] = counts.get(cat, 0) + 1

        missing = []
        purchases = []
        score_accumulator = 0
        total_reqs = len(season_reqs)

        for cat, required_qty in season_reqs.items():
            actual = counts.get(cat, 0)
            if actual < required_qty:
                missing.append(f"{required_qty - actual} more {cat}(s)")
                purchases.append(f"Essential {current_season} {cat}")
                score_accumulator += (actual / required_qty)
            else:
                score_accumulator += 1

        readiness_score = int((score_accumulator / total_reqs) * 100) if total_reqs > 0 else 100

        return {
            "season": current_season,
            "readiness_score": min(100, readiness_score),
            "missing_items": missing,
            "recommended_purchases": purchases
        }

    def _empty_state(self) -> Dict[str, Any]:
        return {
            "season": self._get_current_season(),
            "readiness_score": 0,
            "missing_items": ["All essential seasonal items"],
            "recommended_purchases": ["Core basics for the current season"]
        }

seasonal_readiness_analyzer = SeasonalReadinessAnalyzer()
