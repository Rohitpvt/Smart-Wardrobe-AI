import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.outfit_recommendation import OutfitRecommendation
from app.models.outfit_feedback import OutfitFeedback

class OutfitSuccessPredictor:
    """
    Predicts the success of future outfits or provides general outfit success metrics.
    In MVP, this aggregates historical success and provides improvement suggestions.
    """
    
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        query = select(OutfitRecommendation).where(OutfitRecommendation.user_id == user_id)
        result = await session.execute(query)
        outfits = result.scalars().all()

        if not outfits:
            return self._empty_state()

        # Simple heuristic: average the overall scores if they exist
        scored_outfits = [o for o in outfits if o.overall_score is not None]
        if scored_outfits:
            avg_score = sum(o.overall_score for o in scored_outfits) / len(scored_outfits)
            success_probability = int(avg_score)
            confidence = min(100, len(scored_outfits) * 10)
        else:
            success_probability = 65
            confidence = 30

        reasons = []
        improvements = []
        
        if success_probability > 75:
            reasons.append("High historical acceptance rate of generated outfits.")
        else:
            reasons.append("Limited outfit feedback prevents high-accuracy predictions.")
            improvements.append("Log whether you wore recommended outfits to improve predictions.")

        return {
            "success_probability": success_probability,
            "confidence": confidence,
            "reasons": reasons,
            "improvement_suggestions": improvements
        }

    def _empty_state(self) -> Dict[str, Any]:
        return {
            "success_probability": 0,
            "confidence": 0,
            "reasons": ["No outfit history available to predict success."],
            "improvement_suggestions": ["Generate your first outfit recommendation to establish a baseline."]
        }

outfit_success_predictor = OutfitSuccessPredictor()
