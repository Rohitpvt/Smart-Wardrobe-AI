from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text
import uuid
from typing import List, Dict, Any

from app.models.clothing_item import ClothingItem
from app.models.wear_event import WearEvent

class CostPerWearEngine:
    """
    Calculates Purchase Price / Wear Count natively in SQL.
    """
    
    async def get_cpw_metrics(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        # Perform calculation at the database level to solve O(N) scaling
        wear_count_expr = func.count(WearEvent.id)
        cpw_expr = case(
            (wear_count_expr > 0, ClothingItem.purchase_price / wear_count_expr),
            else_=ClothingItem.purchase_price
        ).label("cpw")
        
        query = (
            select(
                ClothingItem.id,
                ClothingItem.name,
                ClothingItem.category,
                ClothingItem.purchase_price,
                wear_count_expr.label("worn_count"),
                cpw_expr
            )
            .outerjoin(WearEvent, ClothingItem.id == WearEvent.clothing_item_id)
            .where(
                ClothingItem.user_id == user_id,
                ClothingItem.purchase_price.isnot(None),
                ClothingItem.purchase_price > 0
            )
            .group_by(ClothingItem.id)
            .order_by("cpw")
        )
        
        result = await session.execute(query)
        rows = result.all()
        
        metrics = [
            {
                "item_id": str(row.id),
                "name": row.name,
                "category": row.category,
                "purchase_price": float(row.purchase_price),
                "worn_count": row.worn_count,
                "cpw": round(float(row.cpw), 2)
            }
            for row in rows
        ]
        
        return {
            "best_value": metrics[:3] if metrics else [],
            "worst_value": metrics[-3:] if metrics else [],
            "all_metrics": metrics
        }

cost_per_wear_engine = CostPerWearEngine()
