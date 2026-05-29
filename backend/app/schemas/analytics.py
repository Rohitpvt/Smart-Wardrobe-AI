from pydantic import BaseModel
from typing import List, Optional

class CategoryBreakdown(BaseModel):
    category: str
    count: int

class ColorBreakdown(BaseModel):
    color: str
    count: int

class DashboardAnalyticsResponse(BaseModel):
    # Counts
    total_clothes: int
    top_wear_count: int
    bottom_wear_count: int
    footwear_count: int
    accessory_count: int
    
    # Style Insights
    ethnic_wear_count: int
    winter_wear_count: int
    formal_wear_count: int
    
    most_common_color: Optional[str]
    most_used_category: Optional[str]
    
    # Condition/Usage
    rarely_used_count: int
    never_used_count: int
    needs_repair_count: int
    needs_washing_count: int
    
    # Seasons
    summer_clothes_count: int
    winter_clothes_count: int
    monsoon_clothes_count: int
    all_season_clothes_count: int
    
    # Outfits
    saved_outfits_count: int
    outfit_history_count: int
    possible_outfit_combinations_estimate: int
    
    # Breakdowns
    wardrobe_breakdown_by_category: List[CategoryBreakdown]
    wardrobe_breakdown_by_color: List[ColorBreakdown]
    
    # Recent (Frontend will use basic item lists here)
    recent_items: List[dict]
    recently_worn_outfits: List[dict]
