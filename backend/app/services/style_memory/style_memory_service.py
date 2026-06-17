import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.outfit_feedback import OutfitFeedback
from app.services.style_memory.preference_learning_engine import preference_learning_engine
from app.services.style_memory.memory_scoring_engine import memory_scoring_engine
from app.services.style_memory.feedback_analyzer import feedback_analyzer

class StyleMemoryService:
    """
    Orchestrates the Style Memory Domain.
    """

    async def get_style_memory_profile(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        weights = await preference_learning_engine.learn_preferences(session, user_id)
        confidence_data = await memory_scoring_engine.calculate_learning_confidence(session, user_id)
        insights = await feedback_analyzer.generate_insights(session, user_id)

        # Extract top favorites
        colors = weights.get("colors", {})
        categories = weights.get("categories", {})
        formality = weights.get("formality", {})

        favorite_colors = [k for k, v in sorted(colors.items(), key=lambda item: item[1], reverse=True) if v > 0][:5]
        disliked_colors = [k for k, v in sorted(colors.items(), key=lambda item: item[1], reverse=True) if v < 0]
        favorite_categories = [k for k, v in sorted(categories.items(), key=lambda item: item[1], reverse=True) if v > 0][:5]
        
        preferred_style = "neutral"
        if formality:
            sorted_formality = sorted(formality.items(), key=lambda item: item[1], reverse=True)
            if sorted_formality[0][1] > 0:
                preferred_style = sorted_formality[0][0]

        return {
            "favorite_colors": favorite_colors,
            "disliked_colors": disliked_colors,
            "favorite_categories": favorite_categories,
            "preferred_style": preferred_style,
            "confidence_score": confidence_data["confidence_score"],
            "learning_tier": confidence_data["tier"],
            "interaction_count": confidence_data["interaction_count"],
            "recently_learned_insights": insights,
            "weights_dump": weights # Optional for deeper RecommendationConfidenceEngine integration
        }

    async def record_feedback(self, session: AsyncSession, user_id: uuid.UUID, outfit_id: uuid.UUID, feedback_type: str) -> None:
        valid_types = ["like", "love", "dislike", "save_for_later", "wore_it", "skip"]
        if feedback_type not in valid_types:
            raise ValueError(f"Invalid feedback type. Must be one of {valid_types}")
            
        feedback = OutfitFeedback(
            user_id=user_id,
            outfit_id=outfit_id,
            feedback_type=feedback_type,
            feedback_source="manual"
        )
        session.add(feedback)
        await session.commit()

style_memory_service = StyleMemoryService()
