from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any, List

from app.services.shopping_intelligence.wardrobe_roi_engine import wardrobe_roi_engine
from app.services.shopping_intelligence.purchase_justification_engine import purchase_justification_engine
from sqlalchemy import select
from app.models.clothing_item import ClothingItem

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
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        items = (await session.execute(query)).scalars().all()

        opportunities = []

        if len(items) < 3:
            # Insufficient evidence to perform gap analysis
            return opportunities

        categories = {i.category.lower() for i in items if i.category}
        colors = {i.color.lower() for i in items if i.color}
        
        # 1. Outerwear Gap
        if "outerwear" not in categories and len(items) >= 4:
            opportunities.append({
                "item_name": "Wardrobe Gap: Outerwear",
                "category": "Outerwear",
                "color": "Neutral",
                "opportunity_type": "essential_gap",
                "priority_score": 90,
                "roi_score": 85,
                "outfits_unlocked": len([i for i in items if i.category.lower() in ("tops", "bottoms")]),
                "style_compatibility": 80,
                "roi_breakdown": {
                    "outfit_unlock_score": 90,
                    "wardrobe_health_improvement": 85,
                    "style_compatibility": 80,
                    "seasonal_readiness": 95
                },
                "why_this_item": "You have tops and bottoms but lack outerwear for layering.",
                "expected_impact": "Unlocks layering options for transitional weather.",
                "confidence_score": 95,
                "evidence": f"0 outerwear items found in a wardrobe of {len(items)} items.",
                "reasoning": "Outerwear is essential for seasonal versatility and temperature fluctuations."
            })

        # 2. Footwear Gap
        if "footwear" not in categories and "shoes" not in categories and len(items) >= 5:
            opportunities.append({
                "item_name": "Wardrobe Gap: Footwear",
                "category": "Footwear",
                "color": "Any",
                "opportunity_type": "essential_gap",
                "priority_score": 95,
                "roi_score": 90,
                "outfits_unlocked": len(items),
                "style_compatibility": 90,
                "roi_breakdown": {
                    "outfit_unlock_score": 95,
                    "wardrobe_health_improvement": 95,
                    "style_compatibility": 90,
                    "seasonal_readiness": 80
                },
                "why_this_item": "A complete outfit requires footwear.",
                "expected_impact": "Completes your uploaded outfits.",
                "confidence_score": 98,
                "evidence": "No shoes or footwear detected in your uploaded inventory.",
                "reasoning": "Footwear acts as the anchor for styling and is missing from your digital closet."
            })

        # 3. Base Layer / Tops Gap
        tops_count = len([i for i in items if i.category.lower() in ("tops", "shirts", "t-shirts")])
        if tops_count < 2 and len(items) >= 4:
            opportunities.append({
                "item_name": "Wardrobe Gap: Tops",
                "category": "Tops",
                "color": "White/Black",
                "opportunity_type": "high_outfit_unlock",
                "priority_score": 85,
                "roi_score": 80,
                "outfits_unlocked": len([i for i in items if i.category.lower() == "bottoms"]) * 2,
                "style_compatibility": 85,
                "roi_breakdown": {
                    "outfit_unlock_score": 85,
                    "wardrobe_health_improvement": 80,
                    "style_compatibility": 85,
                    "seasonal_readiness": 75
                },
                "why_this_item": "You have a disproportionately low number of tops compared to other items.",
                "expected_impact": "Dramatically increases the number of distinct combinations you can wear.",
                "confidence_score": 88,
                "evidence": f"Only {tops_count} tops found among {len(items)} total items.",
                "reasoning": "Tops are the most frequently rotated item in a wardrobe and require a higher quantity."
            })

        opportunities.sort(key=lambda x: (x["priority_score"], x["roi_score"]), reverse=True)
        return opportunities

purchase_opportunity_engine = PurchaseOpportunityEngine()
