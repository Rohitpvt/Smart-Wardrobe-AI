from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, List

from app.services.intelligence import intelligence_service

class UtilizationPredictor:
    """
    Analyzes current wear patterns to predict items at risk of becoming inactive
    and identifies rotation repetition.
    """

    async def get_rotation_risks(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        health = await intelligence_service.get_wardrobe_health(session, user_id)
        # 100% means perfect usage, lower means items are ignored
        utilization_rate = health.get("utilization_rate", 100)
        
        risks = []
        if utilization_rate < 50:
            inactive_percentage = 100 - utilization_rate
            risks.append({
                "insight": f"{inactive_percentage}% of your wardrobe may become totally inactive within 30 days.",
                "why_it_matters": "Low rotation leads to wasted wardrobe value and style stagnation.",
                "recommended_action": "Try the 'Surprise Me' feature or build an outfit from neglected items.",
                "priority_score": inactive_percentage
            })

        # Check for over-rotation
        usage = await intelligence_service.get_usage_intelligence(session, user_id)
        most_worn = usage.get("most_worn", [])
        if len(most_worn) > 0 and most_worn[0].get("worn_count", 0) > 10:
            risks.append({
                "insight": f"You are repeatedly wearing the same items, like your {most_worn[0].get('name', 'favorite top')}.",
                "why_it_matters": "Over-wearing items accelerates wear-and-tear and limits your style expression.",
                "recommended_action": "Rotate these items out for a week to extend their lifespan.",
                "priority_score": min(100, most_worn[0].get("worn_count", 0) * 5)
            })

        risks.sort(key=lambda x: x["priority_score"], reverse=True)
        return risks

utilization_predictor = UtilizationPredictor()
