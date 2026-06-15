"""
Rotation Intelligence Engine.
Detects overused/neglected items and generates rotation recommendations.
Uses a normalized coefficient-of-variation (CV) approach for the rotation score,
which is stable across both small and large wardrobes.
"""

import math
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem

# Month → inferred season (Northern Hemisphere)
_MONTH_SEASON_MAP = {
    1: "winter", 2: "winter", 3: "spring",
    4: "spring", 5: "spring", 6: "summer",
    7: "summer", 8: "summer", 9: "autumn",
    10: "autumn", 11: "autumn", 12: "winter",
}


class RotationEngine:
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Analyze wardrobe rotation health."""
        stmt = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(stmt)
        items = result.scalars().all()

        if not items:
            return self._empty_result()

        worn_counts = [item.worn_count for item in items]
        total_wears = sum(worn_counts)
        n = len(worn_counts)

        # ── Rotation score via coefficient of variation ──
        mean_wears = total_wears / n if n > 0 else 0.0
        rotation_score = self._compute_rotation_score(worn_counts, mean_wears)

        # ── Overused items: worn_count > mean + 1.5 * std_dev ──
        std_dev = self._std_dev(worn_counts, mean_wears)
        overuse_threshold = mean_wears + 1.5 * std_dev if std_dev > 0 else mean_wears + 1
        overused = [
            item for item in items
            if item.worn_count > overuse_threshold and item.worn_count > 0
        ]
        # Sort by most overused first
        overused.sort(key=lambda x: x.worn_count, reverse=True)
        overused = overused[:5]

        # ── Recommended rotation: least-worn items appropriate for current season ──
        current_month = datetime.now(timezone.utc).month
        current_season = _MONTH_SEASON_MAP[current_month]
        recommended = self._get_seasonal_recommendations(items, current_season, mean_wears)

        # ── Human-readable insights ──
        insights = self._generate_insights(items, overused, total_wears, rotation_score)

        return {
            "rotation_score": rotation_score,
            "overused": overused,
            "recommended_rotation": recommended,
            "insights": insights,
        }

    def _compute_rotation_score(self, worn_counts: List[int], mean: float) -> int:
        """
        Rotation score based on normalized coefficient of variation.
        CV = std_dev / mean. Perfect rotation (all equal) → CV=0 → score=100.
        Guard against low-mean edge cases by requiring mean >= 1.
        """
        if mean < 1.0:
            # Not enough wear data to judge rotation meaningfully
            return 50  # neutral baseline

        std_dev = self._std_dev(worn_counts, mean)
        cv = std_dev / mean  # coefficient of variation

        # Normalize: CV of 0 → 100, CV of 2+ → 0
        # Linear mapping: score = 100 - (cv * 50), clamped [0, 100]
        score = int(100 - (cv * 50))
        return max(0, min(100, score))

    def _std_dev(self, values: List[int], mean: float) -> float:
        """Population standard deviation."""
        if len(values) < 2:
            return 0.0
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def _get_seasonal_recommendations(
        self,
        items: list,
        current_season: str,
        mean_wears: float,
    ) -> list:
        """Pick least-worn items that match the current season."""
        candidates = []
        for item in items:
            season = (item.season or "").lower()
            if (
                "all" in season
                or current_season in season
                or not season  # items without season data are always candidates
            ):
                if item.worn_count <= mean_wears:
                    candidates.append(item)

        candidates.sort(key=lambda x: x.worn_count)
        return candidates[:5]

    def _generate_insights(
        self,
        items: list,
        overused: list,
        total_wears: int,
        rotation_score: int,
    ) -> List[str]:
        """Generate human-readable rotation insights."""
        insights: List[str] = []

        if total_wears == 0:
            insights.append("Start wearing your items to build rotation insights.")
            return insights

        for item in overused[:3]:
            pct = int((item.worn_count / total_wears) * 100) if total_wears > 0 else 0
            insights.append(
                f'Your "{item.name}" has appeared in {pct}% of total wears. Consider giving it a rest.'
            )

        never_worn = [i for i in items if i.worn_count == 0]
        if never_worn:
            insights.append(
                f"You have {len(never_worn)} item{'s' if len(never_worn) > 1 else ''} "
                f"that {'have' if len(never_worn) > 1 else 'has'} never been worn."
            )

        if rotation_score >= 85:
            insights.append("Excellent rotation — you're utilizing your wardrobe evenly!")
        elif rotation_score < 50:
            insights.append("Your wardrobe rotation is uneven. Try diversifying your daily picks.")

        return insights[:5]

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "rotation_score": 0,
            "overused": [],
            "recommended_rotation": [],
            "insights": ["Add items to your wardrobe to see rotation insights."],
        }


rotation_engine = RotationEngine()
