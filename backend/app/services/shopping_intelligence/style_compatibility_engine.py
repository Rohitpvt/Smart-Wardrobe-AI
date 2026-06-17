from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.services.style_memory.style_memory_service import style_memory_service

class StyleCompatibilityEngine:
    """
    Calculates 0-100 style match based on user's Style Memory.
    """
    
    async def get_compatibility(self, session: AsyncSession, user_id: uuid.UUID, potential_item: Dict[str, Any]) -> int:
        memory = await style_memory_service.get_style_memory_profile(session, user_id)
        
        score = 60 # Base score
        
        # Check colors
        favorite_colors = memory.get("favorite_colors", [])
        if potential_item.get("color", "").lower() in [c.lower() for c in favorite_colors]:
            score += 20
            
        # Check categories
        favorite_categories = memory.get("favorite_categories", [])
        if potential_item.get("category", "").lower() in [c.lower() for c in favorite_categories]:
            score += 10
            
        # Preferred style alignment (basic mapping)
        preferred_style = memory.get("preferred_style", "").lower()
        if preferred_style == "casual" and potential_item.get("formality") == "casual":
            score += 10
        elif preferred_style == "formal" and potential_item.get("formality") == "formal":
            score += 10
            
        return min(100, max(0, score))

style_compatibility_engine = StyleCompatibilityEngine()
