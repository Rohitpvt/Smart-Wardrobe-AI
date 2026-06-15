"""
Taste Profile Service.
Synthesizes style DNA, learned preferences, and historical snapshots 
into a cohesive Taste Profile for the user.
"""

import uuid
from typing import Any, Dict, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.services.style_dna_service import style_dna_service
from app.services.preference_learning_service import preference_learning_service
from app.models.style_profile_snapshot import StyleProfileSnapshot
from app.models.outfit_feedback import OutfitFeedback
from app.models.clothing_item import ClothingItem

class TasteProfileService:
    async def generate_profile(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Generate the complete Taste Profile including historical evolution."""
        # 1. Fetch current baseline DNA and learned dynamic preferences
        style_dna = await style_dna_service.analyze(session, user_id)
        preferences = await preference_learning_service.learn_preferences(session, user_id)
        
        # 2. Extract top metrics from preferences
        top_colors = self._get_top_keys(preferences.get("colors", {}), limit=3)
        top_categories = self._get_top_keys(preferences.get("categories", {}), limit=3)

        if not top_colors:
            # Fallback to Style DNA defaults if no feedback exists
            top_colors = [c["name"] for c in style_dna.get("dominant_colors", [])][:3]
        if not top_categories:
            top_categories = [c["name"] for c in style_dna.get("preferred_categories", [])][:3]

        # 3. Calculate Personalization Confidence Score
        personalization_score = await self._calculate_personalization_score(session, user_id, style_dna.get("confidence", 0))

        # 4. Generate Snapshot (Max 1 per week)
        await self._create_snapshot_if_needed(
            session=session,
            user_id=user_id,
            profile_name=style_dna.get("style_type", "Unknown"),
            top_colors=top_colors,
            top_categories=top_categories,
            personalization_score=personalization_score
        )

        # 5. Retrieve Evolution Insights from historical snapshots
        evolution_insights = await self._generate_evolution_insights(session, user_id, top_colors, top_categories)

        return {
            "profile_name": style_dna.get("style_type", "Unknown"),
            "confidence": style_dna.get("confidence", 0),
            "personalization_score": personalization_score,
            "favorite_colors": top_colors,
            "favorite_categories": top_categories,
            "style_evolution": evolution_insights,
            "preference_weights": preferences
        }

    def _get_top_keys(self, weight_dict: Dict[str, int], limit: int) -> List[str]:
        sorted_items = sorted(weight_dict.items(), key=lambda item: item[1], reverse=True)
        return [k for k, v in sorted_items[:limit] if v > 0]

    async def _calculate_personalization_score(
        self, session: AsyncSession, user_id: uuid.UUID, dna_confidence: int
    ) -> int:
        """
        Calculates how personalized the system is based on feedback volume,
        feedback diversity, wear history depth, and style DNA confidence.
        """
        # Feedback volume
        stmt_fb_count = select(func.count()).where(OutfitFeedback.user_id == user_id)
        fb_count = (await session.execute(stmt_fb_count)).scalar() or 0
        volume_score = min(fb_count * 2, 40)  # Max 40 points for 20+ feedbacks

        # Feedback diversity (unique feedback types)
        stmt_fb_div = select(func.count(func.distinct(OutfitFeedback.feedback_type))).where(OutfitFeedback.user_id == user_id)
        fb_div = (await session.execute(stmt_fb_div)).scalar() or 0
        div_score = min(fb_div * 5, 20)  # Max 20 points for 4+ distinct types

        # Wear history depth
        stmt_wears = select(func.sum(ClothingItem.worn_count)).where(ClothingItem.user_id == user_id)
        wears = (await session.execute(stmt_wears)).scalar() or 0
        wear_score = min(wears, 20)  # Max 20 points for 20+ wears

        # DNA confidence baseline
        dna_score = (dna_confidence / 100.0) * 20  # Max 20 points from DNA confidence

        total = int(volume_score + div_score + wear_score + dna_score)
        return max(0, min(100, total))

    async def _create_snapshot_if_needed(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID, 
        profile_name: str, 
        top_colors: List[str], 
        top_categories: List[str],
        personalization_score: int
    ):
        """Creates a snapshot if the last one was more than 7 days ago."""
        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        stmt = (
            select(StyleProfileSnapshot)
            .where(StyleProfileSnapshot.user_id == user_id)
            .order_by(desc(StyleProfileSnapshot.created_at))
            .limit(1)
        )
        last_snapshot = (await session.execute(stmt)).scalars().first()

        if not last_snapshot or last_snapshot.created_at < one_week_ago:
            new_snapshot = StyleProfileSnapshot(
                user_id=user_id,
                profile_name=profile_name,
                top_colors={"items": top_colors},
                top_categories={"items": top_categories},
                personalization_score=personalization_score
            )
            session.add(new_snapshot)
            await session.commit()

    async def _generate_evolution_insights(
        self, session: AsyncSession, user_id: uuid.UUID, current_colors: List[str], current_categories: List[str]
    ) -> List[str]:
        """Generates textual insights comparing current state to older snapshots."""
        insights = []
        
        # Fetch snapshots ordered by newest first
        stmt = (
            select(StyleProfileSnapshot)
            .where(StyleProfileSnapshot.user_id == user_id)
            .order_by(desc(StyleProfileSnapshot.created_at))
            .limit(10)
        )
        snapshots = (await session.execute(stmt)).scalars().all()
        
        if len(snapshots) < 2:
            insights.append("Keep logging feedback and wears to generate style evolution insights.")
            return insights

        oldest = snapshots[-1]
        
        old_colors = oldest.top_colors.get("items", [])
        old_categories = oldest.top_categories.get("items", [])
        
        if current_colors and old_colors and current_colors[0] != old_colors[0]:
            insights.append(f"Your primary color preference has shifted from {old_colors[0]} to {current_colors[0]}.")
            
        if current_categories and old_categories and current_categories[0] != old_categories[0]:
            insights.append(f"You have increasingly favored {current_categories[0]} over {old_categories[0]} recently.")
            
        if oldest.profile_name != snapshots[0].profile_name:
            insights.append(f"Your overall style has evolved from '{oldest.profile_name}' into '{snapshots[0].profile_name}'.")
            
        if not insights:
            insights.append("Your style preferences have remained wonderfully consistent.")
            
        return insights


taste_profile_service = TasteProfileService()
