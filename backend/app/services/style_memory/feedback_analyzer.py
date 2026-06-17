import uuid
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.models.outfit_feedback import OutfitFeedback
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.style_memory.preference_learning_engine import preference_learning_engine
from app.services.style_memory.memory_scoring_engine import memory_scoring_engine

class FeedbackAnalyzer:
    """
    Analyzes raw feedback data to generate actionable insights and trends.
    """

    async def generate_insights(self, session: AsyncSession, user_id: uuid.UUID) -> List[str]:
        # Get cumulative weights
        weights = await preference_learning_engine.learn_preferences(session, user_id)
        
        insights = []
        
        # Color insights
        colors = weights.get("colors", {})
        if colors:
            sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
            if sorted_colors[0][1] >= 5:
                insights.append(f"You show a strong preference for {sorted_colors[0][0]} outfits")
            
            # Find disliked colors
            disliked = [c for c, w in sorted_colors if w < 0]
            if disliked:
                insights.append(f"You tend to avoid {disliked[-1]} in your outfits")

        # Category insights
        categories = weights.get("categories", {})
        if categories:
            sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
            if sorted_cats[0][1] >= 5:
                insights.append(f"You frequently prefer outfits featuring {sorted_cats[0][0]}")

        # Formality insights
        formality = weights.get("formality", {})
        if formality:
            sorted_form = sorted(formality.items(), key=lambda x: x[1], reverse=True)
            if sorted_form[0][1] >= 5:
                insights.append(f"Your style leans heavily towards {sorted_form[0][0]} aesthetics")

        # Fallback if no insights
        if not insights:
            insights.append("Interact with more outfits to generate personalized styling insights")

        return insights[:5]

feedback_analyzer = FeedbackAnalyzer()
