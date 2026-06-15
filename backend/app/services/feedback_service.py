"""
Feedback Service.
Records user interactions (likes, dislikes, etc.) on outfit recommendations.
"""

import uuid
from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone

from app.models.outfit_feedback import OutfitFeedback

class FeedbackService:
    async def record_feedback(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID, 
        outfit_id: uuid.UUID, 
        feedback_type: str,
        source: str = "manual"
    ) -> OutfitFeedback:
        """Record a feedback event for an outfit."""
        # Create a new record instead of updating to preserve history
        new_feedback = OutfitFeedback(
            user_id=user_id,
            outfit_id=outfit_id,
            feedback_type=feedback_type,
            feedback_source=source
        )
        session.add(new_feedback)
        await session.commit()
        await session.refresh(new_feedback)
        return new_feedback

    async def get_feedback_history(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID, 
        limit: int = 50
    ) -> List[OutfitFeedback]:
        """Retrieve recent feedback history for a user."""
        stmt = (
            select(OutfitFeedback)
            .where(OutfitFeedback.user_id == user_id)
            .order_by(desc(OutfitFeedback.created_at))
            .limit(limit)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

feedback_service = FeedbackService()
