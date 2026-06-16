import uuid
from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.weather.provider import WeatherContext
from app.services.recommendations.engine import is_color_compatible, RecommendationError
from app.services.recommendations.outfit_scoring import outfit_scoring_engine

class OutfitCompletionEngine:
    """
    Engine to build a complete outfit around a pre-selected anchor item.
    """
    async def build_around_anchor(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        anchor_item: ClothingItem,
        occasion: str,
        weather: WeatherContext
    ) -> Tuple[ClothingItem, ClothingItem, ClothingItem, Optional[ClothingItem], Dict[str, Any]]:
        """
        Builds an outfit around the anchor item.
        Returns: (top, bottom, shoes, outerwear, scores)
        """
        anchor_cat = anchor_item.category.upper()
        
        # 1. Fetch Wardrobe (Lightweight tuples)
        result = await session.execute(
            select(ClothingItem.id, ClothingItem.category, ClothingItem.color, ClothingItem.season).where(
                ClothingItem.user_id == user_id,
                func.upper(ClothingItem.category).in_(["TOPWEAR", "BOTTOMWEAR", "FOOTWEAR", "OUTERWEAR"])
            )
        )
        items = result.all()
        
        tops = [i for i in items if i.category.upper() == "TOPWEAR"]
        bottoms = [i for i in items if i.category.upper() == "BOTTOMWEAR"]
        shoes = [i for i in items if i.category.upper() == "FOOTWEAR"]
        outerwears = [i for i in items if i.category.upper() == "OUTERWEAR"]

        # Ensure base categories are present
        if not tops and anchor_cat != "TOPWEAR": raise RecommendationError("INSUFFICIENT_TOPWEAR", "Not enough topwear items.")
        if not bottoms and anchor_cat != "BOTTOMWEAR": raise RecommendationError("INSUFFICIENT_BOTTOMWEAR", "Not enough bottomwear items.")
        if not shoes and anchor_cat != "FOOTWEAR": raise RecommendationError("INSUFFICIENT_FOOTWEAR", "Not enough footwear items.")

        # Weather/Season Target
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
            target_seasons.update({"SUMMER", "WINTER", "SPRING", "AUTUMN"})
            
        def filter_season(item_list) -> List:
            return [i for i in item_list if not i.season or i.season.upper() in target_seasons]

        s_tops = filter_season(tops)
        s_bottoms = filter_season(bottoms)
        s_shoes = filter_season(shoes)
        s_outerwears = filter_season(outerwears)

        winning_combo_ids = None
        
        # Helper to check color compatibility with anchor
        def check_compatibility(t, b, s, o=None):
            if not is_color_compatible(t.color, b.color): return False
            if not is_color_compatible(b.color, s.color): return False
            if not is_color_compatible(t.color, s.color): return False
            if o and not is_color_compatible(o.color, t.color): return False
            if o and not is_color_compatible(o.color, b.color): return False
            return True

        # Pre-seed lists with anchor
        search_tops = s_tops if anchor_cat != "TOPWEAR" else [anchor_item]
        search_bottoms = s_bottoms if anchor_cat != "BOTTOMWEAR" else [anchor_item]
        search_shoes = s_shoes if anchor_cat != "FOOTWEAR" else [anchor_item]
        search_outer = s_outerwears if anchor_cat != "OUTERWEAR" else [anchor_item]

        # Determine if we should look for outerwear
        # If anchor is OUTERWEAR, we must find outerwear.
        # If anchor is TOPWEAR, outerwear is optional.
        # For simplicity, we try to find a matching outerwear if weather dictates or if we want an enhanced outfit.
        use_outerwear = anchor_cat == "OUTERWEAR" or (weather.temperature_celsius is not None and weather.temperature_celsius < 20.0)

        # Passes logic
        for pass_num in range(4):
            # Pass 0: Strict + Outerwear
            # Pass 1: Strict No Outerwear (unless anchor IS outerwear)
            # Pass 2: Relaxed Season No Outerwear
            # Pass 3: Relaxed Color No Outerwear
            
            if pass_num == 0 and not use_outerwear and anchor_cat != "OUTERWEAR":
                continue # Skip outerwear pass if not needed

            current_tops = search_tops if pass_num < 2 else tops if anchor_cat != "TOPWEAR" else [anchor_item]
            current_bottoms = search_bottoms if pass_num < 2 else bottoms if anchor_cat != "BOTTOMWEAR" else [anchor_item]
            current_shoes = search_shoes if pass_num < 2 else shoes if anchor_cat != "FOOTWEAR" else [anchor_item]
            
            # Outerwear search only in Pass 0
            current_outer = search_outer if pass_num == 0 else ([anchor_item] if anchor_cat == "OUTERWEAR" else [])

            if pass_num == 0 and current_outer:
                for t in current_tops:
                    for b in current_bottoms:
                        for s in current_shoes:
                            for o in current_outer:
                                if check_compatibility(t, b, s, o):
                                    winning_combo_ids = (t.id, b.id, s.id, o.id)
                                    break
                            if winning_combo_ids: break
                        if winning_combo_ids: break
                    if winning_combo_ids: break
            else:
                for t in current_tops:
                    for b in current_bottoms:
                        for s in current_shoes:
                            if pass_num == 3 or check_compatibility(t, b, s):
                                winning_combo_ids = (t.id, b.id, s.id, None)
                                break
                        if winning_combo_ids: break
                    if winning_combo_ids: break
            
            if winning_combo_ids:
                break
                
        # Complete Fallback if absolutely nothing matches
        if not winning_combo_ids:
            winning_combo_ids = (
                search_tops[0].id if anchor_cat != "TOPWEAR" else anchor_item.id,
                search_bottoms[0].id if anchor_cat != "BOTTOMWEAR" else anchor_item.id,
                search_shoes[0].id if anchor_cat != "FOOTWEAR" else anchor_item.id,
                anchor_item.id if anchor_cat == "OUTERWEAR" else None
            )

        # Re-fetch full objects
        fetch_ids = [i for i in winning_combo_ids if i is not None]
        final_query = await session.execute(
            select(ClothingItem).where(ClothingItem.id.in_(fetch_ids))
        )
        final_items = {i.id: i for i in final_query.scalars().all()}
        
        # If the anchor is ACCESSORY, it wasn't fetched above unless we explicitly included it
        # The prompt says anchor can be ACCESSORY. If it is, the triad is just top/bottom/shoes.
        
        top_obj = final_items.get(winning_combo_ids[0]) or anchor_item
        bottom_obj = final_items.get(winning_combo_ids[1]) or anchor_item
        shoe_obj = final_items.get(winning_combo_ids[2]) or anchor_item
        outer_obj = final_items.get(winning_combo_ids[3]) if winning_combo_ids[3] else None

        # 3. Calculate Backend Confidence Score
        # Using existing outfit scoring engine
        scores = outfit_scoring_engine.score_outfit(
            top=top_obj,
            bottom=bottom_obj,
            footwear=shoe_obj,
            occasion=occasion,
            weather=weather
        )

        return (top_obj, bottom_obj, shoe_obj, outer_obj, scores)

outfit_completion_engine = OutfitCompletionEngine()
