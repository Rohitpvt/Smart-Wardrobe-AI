from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, List

from app.services.shopping_intelligence.purchase_opportunity_engine import purchase_opportunity_engine

class WardrobeGapAnalyzer:
    """
    Evaluates category coverage using the central Purchase Opportunity Engine.
    """

    async def identify_gaps(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        opportunities = await purchase_opportunity_engine.get_opportunities(session, user_id)
        
        gaps = []
        for opp in opportunities:
            # We only extract opportunities that are explicitly gaps
            if opp.get("opportunity_type") == "essential_gap":
                gaps.append({
                    "insight": f"You are missing a core item: {opp.get('category', 'Category')}",
                    "why_it_matters": opp.get("reasoning", "This gap limits your outfit combinations."),
                    "recommended_action": opp.get("expected_impact", "Consider filling this gap."),
                    "priority_score": opp.get("priority_score", 50)
                })
                
        return gaps

wardrobe_gap_analyzer = WardrobeGapAnalyzer()
