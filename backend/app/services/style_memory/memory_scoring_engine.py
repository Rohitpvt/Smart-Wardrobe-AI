import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.outfit_feedback import OutfitFeedback

class MemoryScoringEngine:
    """
    Computes Learning Confidence Levels based on the volume of user interaction.
    """

    async def calculate_learning_confidence(self, session: AsyncSession, user_id: uuid.UUID) -> dict:
        stmt = select(func.count(OutfitFeedback.id)).where(OutfitFeedback.user_id == user_id)
        result = await session.execute(stmt)
        interaction_count = result.scalar_one_or_none() or 0

        # Base confidence calculation (cap at 100)
        confidence_score = min(100, int((interaction_count / 100) * 100))
        
        if interaction_count >= 100:
            tier = "Highly Personalized Profile"
        elif interaction_count >= 51:
            tier = "Established Profile"
        elif interaction_count >= 21:
            tier = "Developing Profile"
        else:
            tier = "Beginner Profile"

        return {
            "interaction_count": interaction_count,
            "confidence_score": confidence_score,
            "tier": tier
        }

memory_scoring_engine = MemoryScoringEngine()
