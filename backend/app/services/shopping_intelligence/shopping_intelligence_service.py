from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any, List

from app.services.shopping_intelligence.purchase_opportunity_engine import purchase_opportunity_engine

class ShoppingIntelligenceService:
    
    async def get_opportunities(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        return await purchase_opportunity_engine.get_opportunities(session, user_id)

shopping_intelligence_service = ShoppingIntelligenceService()
