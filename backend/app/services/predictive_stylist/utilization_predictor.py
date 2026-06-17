from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, List

from app.services.intelligence import intelligence_service

class UtilizationPredictor:
    """
    Analyzes current wear patterns to calculate deterministic rotation statistics.
    """

    async def get_rotation_risks(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        usage = await intelligence_service.get_usage_intelligence(session, user_id)
        
        # If no wear history exists
        if not usage or (not usage.get("most_worn") and not usage.get("least_worn")):
            return []
            
        most_worn = usage.get("most_worn", [])
        least_worn = usage.get("least_worn", [])
        
        risks = []
        
        # Risk 1: Over-rotation
        if most_worn and most_worn[0].get("worn_count", 0) > 10:
            item = most_worn[0]
            risks.append({
                "insight": f"High utilization detected on {item.get('name', 'favorite item')}.",
                "why_it_matters": f"This item has been worn {item.get('worn_count')} times, which is significantly above average.",
                "recommended_action": "Consider rotating this item out to extend its lifespan and increase outfit variety.",
                "priority_score": min(100, item.get("worn_count", 0) * 5)
            })

        # Risk 2: Under-rotation (deterministic days unworn)
        if least_worn:
            for item in least_worn:
                days_unworn = item.get("days_since_last_worn", 0)
                if days_unworn >= 30:
                    risks.append({
                        "insight": f"{item.get('name', 'Item')} has not been worn in {days_unworn} days.",
                        "why_it_matters": "Wardrobe value is locked in unworn items.",
                        "recommended_action": "Incorporate this into your next outfit or consider donating it.",
                        "priority_score": min(100, int(days_unworn / 2))
                    })
                    break # just surface the top one to avoid flooding

        risks.sort(key=lambda x: x["priority_score"], reverse=True)
        return risks

utilization_predictor = UtilizationPredictor()
