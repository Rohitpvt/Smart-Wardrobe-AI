import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc

from app.models.style_profile_snapshot import StyleProfileSnapshot

class FashionEvolutionTracker:
    """
    Tracks style changes and wardrobe growth over time.
    """
    
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        query = select(StyleProfileSnapshot).where(StyleProfileSnapshot.user_id == user_id).order_by(asc(StyleProfileSnapshot.created_at))
        result = await session.execute(query)
        snapshots = result.scalars().all()

        if not snapshots:
            return self._empty_state()

        timeline = []
        major_changes = []

        # Simple evolution logic
        for snap in snapshots:
            timeline.append({
                "date": snap.created_at.isoformat(),
                "event": f"Profile Snapshot: {snap.profile_name}",
                "description": f"Top colors: {', '.join(snap.top_colors.keys())}"
            })

        if len(snapshots) > 1:
            first = snapshots[0]
            last = snapshots[-1]
            if first.profile_name != last.profile_name:
                major_changes.append(f"Shifted from {first.profile_name} to {last.profile_name}")
            else:
                major_changes.append("Style has remained consistent over the tracked period.")
            growth_score = min(100, last.personalization_score + (len(snapshots) * 5))
        else:
            major_changes.append("Initial style baseline established.")
            growth_score = snapshots[0].personalization_score

        return {
            "timeline": timeline,
            "major_changes": major_changes,
            "growth_score": growth_score
        }

    def _empty_state(self) -> Dict[str, Any]:
        return {
            "timeline": [],
            "major_changes": ["Not enough data to track evolution."],
            "growth_score": 0
        }

fashion_evolution_tracker = FashionEvolutionTracker()
