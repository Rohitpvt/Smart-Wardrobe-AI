from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any, List

from app.services.shopping_intelligence.wardrobe_roi_engine import wardrobe_roi_engine
from app.services.shopping_intelligence.purchase_justification_engine import purchase_justification_engine

class PurchaseOpportunityEngine:
    """
    Evaluates and prioritizes recommendations.
    Hierarchy:
    1. Essential Gap
    2. High Outfit Unlock
    3. High Wardrobe Health Improvement
    4. Seasonal Need
    5. Style Upgrade
    """
    
    async def get_opportunities(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        # Hardcoded set of hypothetical items to test the engine (acts as our catalog)
        catalog = [
            {"name": "Lightweight Navy Overshirt", "category": "Outerwear", "color": "Navy", "formality": "smart_casual", "season": "spring"},
            {"name": "White Leather Sneaker", "category": "Footwear", "color": "White", "formality": "casual", "season": "all"},
            {"name": "Charcoal Tailored Trousers", "category": "Bottoms", "color": "Charcoal", "formality": "formal", "season": "all"},
            {"name": "Linen Button-Down", "category": "Tops", "color": "Olive", "formality": "smart_casual", "season": "summer"}
        ]
        
        opportunities = []
        
        for item in catalog:
            roi_data = await wardrobe_roi_engine.calculate_roi(session, user_id, item)
            
            # Determine primary type based on breakdown
            b = roi_data["breakdown"]
            opportunity_type = "style_upgrade" # default
            priority_score = 50
            
            if b["wardrobe_health_improvement"] > 80:
                opportunity_type = "essential_gap"
                priority_score = 100
            elif b["outfit_unlock_score"] > 70:
                opportunity_type = "high_outfit_unlock"
                priority_score = 90
            elif b["wardrobe_health_improvement"] > 60:
                opportunity_type = "high_wardrobe_health_improvement"
                priority_score = 80
            elif b["seasonal_readiness"] > 70:
                opportunity_type = "seasonal_need"
                priority_score = 70
                
            justification = purchase_justification_engine.generate_justification(item, roi_data, opportunity_type)
            
            opportunities.append({
                "item_name": item["name"],
                "category": item["category"],
                "color": item["color"],
                "opportunity_type": opportunity_type,
                "priority_score": priority_score,
                "roi_score": roi_data["roi_score"],
                "outfits_unlocked": roi_data["outfits_unlocked"],
                "style_compatibility": b["style_compatibility"],
                "roi_breakdown": b,
                "why_this_item": justification["why_this_item"],
                "expected_impact": justification["expected_impact"]
            })
            
        opportunities.sort(key=lambda x: (x["priority_score"], x["roi_score"]), reverse=True)
        return opportunities

purchase_opportunity_engine = PurchaseOpportunityEngine()
