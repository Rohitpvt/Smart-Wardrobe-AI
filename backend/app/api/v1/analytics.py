"""
Analytics API.

GET /api/v1/analytics/dashboard - Get wardrobe insights and usage data
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from collections import Counter
import logging

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.outfit import SavedOutfit, OutfitHistory
from app.schemas.analytics import DashboardAnalyticsResponse
from app.api.v1.outfits import _build_item_summary, _get_item_from_list
from app.core.s3 import generate_presigned_url

logger = logging.getLogger(__name__)
analytics_router = APIRouter()

def get_outfit_role(category: str) -> str:
    """Infer the general role (top/bottom/etc) based on category string."""
    cat = (category or "").lower()
    if cat in ["t-shirt", "shirt", "top", "sweater", "hoodie", "jacket", "coat", "suit", "kurta"]:
        return "top"
    elif cat in ["pants", "jeans", "shorts", "skirt", "trouser", "trackpants"]:
        return "bottom"
    elif cat in ["shoes", "sneakers", "boots", "sandals", "heels", "loafers", "formal shoes", "slippers"]:
        return "footwear"
    elif cat in ["watch", "belt", "hat", "cap", "sunglasses", "jewelry", "bag", "tie"]:
        return "accessory"
    return "other"


@analytics_router.get("/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Return comprehensive analytics for the user's dashboard."""
    
    # Fetch all active clothing items
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.user_id == current_user.id,
            ClothingItem.is_deleted == False
        ).order_by(ClothingItem.created_at.desc())
    )
    items = result.scalars().all()

    # Basic Counts
    total_clothes = len(items)
    
    # Breakdowns
    roles = {"top": 0, "bottom": 0, "footwear": 0, "accessory": 0, "other": 0}
    colors_counter = Counter()
    category_counter = Counter()
    condition_counter = Counter()
    season_counter = Counter()

    ethnic_wear = 0
    winter_wear = 0
    formal_wear = 0
    
    rarely_used = 0
    never_used = 0
    needs_repair = 0
    needs_washing = 0

    recent_items_list = []

    for idx, item in enumerate(items):
        if idx < 5:
            # Grab top 5 most recently created items
            url = None
            if item.front_image_key:
                try:
                    url = generate_presigned_url(item.front_image_key)
                except:
                    pass
                
            recent_items_list.append({
                "id": str(item.id),
                "type": item.type,
                "primary_color": item.primary_color,
                "front_image_url": url,
            })

        # Roles
        role = get_outfit_role(item.category)
        roles[role] += 1
        
        # Color & Category
        if item.primary_color: colors_counter[item.primary_color.title()] += 1
        if item.category: category_counter[item.category.title()] += 1
        
        # Styles / Contexts
        cat_lower = (item.category or "").lower()
        type_lower = (item.type or "").lower()
        occasion_lower = (item.occasion or "").lower()
        season_lower = (item.season or "").lower()
        
        if "ethnic" in occasion_lower or "kurta" in cat_lower or "saree" in cat_lower:
            ethnic_wear += 1
        if "formal" in occasion_lower or "suit" in cat_lower or "tie" in cat_lower:
            formal_wear += 1
        if "winter" in season_lower or "jacket" in cat_lower or "sweater" in cat_lower or "coat" in cat_lower:
            winter_wear += 1
            
        # Conditions
        cond = (item.condition or "").lower()
        if "damaged" in cond or "repair" in cond:
            needs_repair += 1
        if "faded" in cond or "washing" in cond:
            needs_washing += 1
            
        if item.condition: condition_counter[item.condition.title()] += 1
        if item.season: season_counter[item.season.title()] += 1
            
        # Usage tracking
        if item.wear_count == 0:
            never_used += 1
        elif item.wear_count == 1:
            rarely_used += 1
        else:
            # Fallback to usage_frequency field if wear_count wasn't strictly used
            usage = (item.usage_frequency or "").lower()
            if usage == "never used": never_used += 1
            elif usage == "rarely used": rarely_used += 1

    # Season stats specifically requested
    summer_clothes = season_counter.get("Summer", 0)
    winter_clothes = season_counter.get("Winter", 0)
    monsoon_clothes = season_counter.get("Monsoon", 0) + season_counter.get("Rainy", 0)
    all_season_clothes = season_counter.get("All-Season", 0) + season_counter.get("All Season", 0)

    # Possible Combinations Estimate
    top_c = roles["top"]
    bot_c = roles["bottom"]
    foot_c = roles["footwear"]
    combinations = top_c * bot_c * foot_c

    # Saved Outfits Count
    saved_res = await db.execute(select(func.count(SavedOutfit.id)).where(SavedOutfit.user_id == current_user.id))
    saved_outfits_count = saved_res.scalar() or 0

    # Outfit History Count
    history_res = await db.execute(select(func.count(OutfitHistory.id)).where(OutfitHistory.user_id == current_user.id))
    outfit_history_count = history_res.scalar() or 0

    # Fetch recently worn outfits (top 3)
    recent_history_res = await db.execute(
        select(OutfitHistory)
        .where(OutfitHistory.user_id == current_user.id)
        .order_by(OutfitHistory.worn_date.desc())
        .limit(3)
    )
    recent_outfits = recent_history_res.scalars().all()
    
    recent_outfits_list = []
    if recent_outfits:
        # Resolve their top items just for display
        for ro in recent_outfits:
            recent_outfits_list.append({
                "id": str(ro.id),
                "weather": ro.weather,
                "occasion": ro.occasion,
                "worn_date": ro.worn_date.isoformat(),
            })

    most_common_color = colors_counter.most_common(1)[0][0] if colors_counter else None
    most_used_category = category_counter.most_common(1)[0][0] if category_counter else None

    # Format lists
    breakdown_cat = [{"category": k, "count": v} for k, v in category_counter.most_common(5)]
    breakdown_col = [{"color": k, "count": v} for k, v in colors_counter.most_common(5)]

    return DashboardAnalyticsResponse(
        total_clothes=total_clothes,
        top_wear_count=roles["top"],
        bottom_wear_count=roles["bottom"],
        footwear_count=roles["footwear"],
        accessory_count=roles["accessory"],
        
        ethnic_wear_count=ethnic_wear,
        winter_wear_count=winter_wear,
        formal_wear_count=formal_wear,
        
        most_common_color=most_common_color,
        most_used_category=most_used_category,
        
        rarely_used_count=rarely_used,
        never_used_count=never_used,
        needs_repair_count=needs_repair,
        needs_washing_count=needs_washing,
        
        summer_clothes_count=summer_clothes,
        winter_clothes_count=winter_clothes,
        monsoon_clothes_count=monsoon_clothes,
        all_season_clothes_count=all_season_clothes,
        
        saved_outfits_count=saved_outfits_count,
        outfit_history_count=outfit_history_count,
        possible_outfit_combinations_estimate=combinations,
        
        wardrobe_breakdown_by_category=breakdown_cat,
        wardrobe_breakdown_by_color=breakdown_col,
        
        recent_items=recent_items_list,
        recently_worn_outfits=recent_outfits_list
    )
