import uuid
from datetime import datetime, timedelta
from typing import List, Set, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.weather.provider import WeatherContext

# Color Compatibility Graph
# Adheres strictly to Phase 6.0 Matrix
COLOR_MATRIX = {
    "black": {"white", "grey", "blue", "beige", "red", "black"}, # Added self compatibility
    "white": {"black", "blue", "grey", "beige", "brown", "white"},
    "blue": {"white", "black", "grey", "beige", "brown", "blue"},
    "grey": {"black", "white", "blue", "beige", "grey"},
    "beige": {"black", "white", "blue", "grey", "brown", "beige"},
    "brown": {"white", "blue", "beige", "brown"}
}

FALLBACK_COLORS = {"black", "white", "grey"}

def is_color_compatible(c1: str, c2: str) -> bool:
    c1 = c1.lower().strip()
    c2 = c2.lower().strip()
    
    # Same color is trivially compatible unless stated otherwise, but let's assume it's okay for monochrome
    if c1 == c2:
        return True
        
    set_c1 = COLOR_MATRIX.get(c1, FALLBACK_COLORS)
    set_c2 = COLOR_MATRIX.get(c2, FALLBACK_COLORS)
    
    # Bi-directional compatibility check
    return (c2 in set_c1) and (c1 in set_c2)

def is_triad_compatible(top: ClothingItem, bottom: ClothingItem, footwear: ClothingItem) -> bool:
    """Validate all three items are pairwise compatible with each other"""
    # Top and Bottom
    if not is_color_compatible(top.color, bottom.color): return False
    # Bottom and Footwear
    if not is_color_compatible(bottom.color, footwear.color): return False
    # Top and Footwear
    if not is_color_compatible(top.color, footwear.color): return False
    
    return True

class RecommendationError(Exception):
    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        super().__init__(message)


class OutfitEngine:
    async def generate_outfit(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID, 
        occasion: str, 
        weather: WeatherContext
    ) -> Tuple[ClothingItem, ClothingItem, ClothingItem]:
        from sqlalchemy import func
        
        # 1. Fetch Wardrobe (Lightweight tuples to avoid ORM instantiation overhead)
        result = await session.execute(
            select(ClothingItem.id, ClothingItem.category, ClothingItem.color, ClothingItem.season).where(
                ClothingItem.user_id == user_id,
                func.upper(ClothingItem.category).in_(["TOPWEAR", "BOTTOMWEAR", "FOOTWEAR"])
            )
        )
        items = result.all()
        
        tops = [i for i in items if i.category.upper() == "TOPWEAR"]
        bottoms = [i for i in items if i.category.upper() == "BOTTOMWEAR"]
        shoes = [i for i in items if i.category.upper() == "FOOTWEAR"]
        
        # Fast exit for missing base categories
        if not tops: raise RecommendationError("INSUFFICIENT_TOPWEAR", "Not enough topwear items.")
        if not bottoms: raise RecommendationError("INSUFFICIENT_BOTTOMWEAR", "Not enough bottomwear items.")
        if not shoes: raise RecommendationError("INSUFFICIENT_FOOTWEAR", "Not enough footwear items.")

        # 2. Weather/Season Target
        target_seasons = {"ALL_SEASON"}
        if weather.weather_used and weather.temperature_celsius is not None:
            temp = weather.temperature_celsius
            if temp > 25.0:
                target_seasons.update({"SUMMER"})
            elif temp < 15.0:
                target_seasons.update({"WINTER", "AUTUMN"})
            else:
                target_seasons.update({"SPRING", "AUTUMN"})
        else:
            # No weather logic, apply all season logic or bypass
            target_seasons.update({"SUMMER", "WINTER", "SPRING", "AUTUMN"})
            
        def filter_season(item_list) -> List:
            return [i for i in item_list if not i.season or i.season.upper() in target_seasons]

        # 3. Deduplication History (7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        history_query = await session.execute(
            select(OutfitRecommendation).where(
                OutfitRecommendation.user_id == user_id,
                OutfitRecommendation.occasion == occasion,
                OutfitRecommendation.created_at >= seven_days_ago
            )
        )
        used_combinations = set()
        for rec in history_query.scalars().all():
            if rec.top_item_id and rec.bottom_item_id and rec.footwear_item_id:
                used_combinations.add((str(rec.top_item_id), str(rec.bottom_item_id), str(rec.footwear_item_id)))

        # Pre-filter lists
        s_tops = filter_season(tops)
        s_bottoms = filter_season(bottoms)
        s_shoes = filter_season(shoes)

        # Fallback Hierarchy execution
        winning_combo_ids = None
        
        # PASS 1: Strict (Season + Color + Deduplication)
        if not winning_combo_ids:
            for t in s_tops:
                for b in s_bottoms:
                    for s in s_shoes:
                        combo = (str(t.id), str(b.id), str(s.id))
                        if combo not in used_combinations and is_triad_compatible(t, b, s):
                            winning_combo_ids = (t.id, b.id, s.id)
                            break
                    if winning_combo_ids: break
                if winning_combo_ids: break

        # PASS 2: Relaxed Season (All items + Color + Deduplication)
        if not winning_combo_ids:
            for t in tops:
                for b in bottoms:
                    for s in shoes:
                        combo = (str(t.id), str(b.id), str(s.id))
                        if combo not in used_combinations and is_triad_compatible(t, b, s):
                            winning_combo_ids = (t.id, b.id, s.id)
                            break
                    if winning_combo_ids: break
                if winning_combo_ids: break

        # PASS 3: Relaxed Color (All items + Any Color + Deduplication)
        if not winning_combo_ids:
            for t in tops:
                for b in bottoms:
                    for s in shoes:
                        combo = (str(t.id), str(b.id), str(s.id))
                        if combo not in used_combinations:
                            winning_combo_ids = (t.id, b.id, s.id)
                            break
                    if winning_combo_ids: break
                if winning_combo_ids: break

        # PASS 4: Complete Fallback (Allow Used Combinations)
        if not winning_combo_ids:
            for t in tops:
                for b in bottoms:
                    for s in shoes:
                        if is_triad_compatible(t, b, s):
                            winning_combo_ids = (t.id, b.id, s.id)
                            break
                    if winning_combo_ids: break
                if winning_combo_ids: break
                        
        # If no color compatible combination exists at all, just return the first items
        if not winning_combo_ids:
            winning_combo_ids = (tops[0].id, bottoms[0].id, shoes[0].id)
            
        # Re-fetch the 3 winning items fully from the DB
        final_query = await session.execute(
            select(ClothingItem).where(ClothingItem.id.in_(winning_combo_ids))
        )
        final_items = final_query.scalars().all()
        
        # Order them correctly to Top, Bottom, Shoe
        top_obj = next(i for i in final_items if i.id == winning_combo_ids[0])
        bottom_obj = next(i for i in final_items if i.id == winning_combo_ids[1])
        shoe_obj = next(i for i in final_items if i.id == winning_combo_ids[2])
        
        return (top_obj, bottom_obj, shoe_obj)

outfit_engine = OutfitEngine()
