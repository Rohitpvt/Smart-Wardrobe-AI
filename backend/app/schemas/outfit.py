from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Shared generic item summary
class ClothingItemSummary(BaseModel):
    id: UUID
    type: str
    category: str
    primary_color: str
    front_image_url: Optional[str] = None

# --- SavedOutfit ---
class SavedOutfitCreate(BaseModel):
    name: str
    top_item_id: Optional[UUID] = None
    bottom_item_id: Optional[UUID] = None
    footwear_item_id: Optional[UUID] = None
    accessory_item_id: Optional[UUID] = None
    occasion: Optional[str] = None
    season: Optional[str] = None
    notes: Optional[str] = None

class SavedOutfitResponse(BaseModel):
    id: UUID
    name: str
    occasion: Optional[str] = None
    season: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    
    # Detailed items (injected by backend)
    top_item: Optional[ClothingItemSummary] = None
    bottom_item: Optional[ClothingItemSummary] = None
    footwear_item: Optional[ClothingItemSummary] = None
    accessory_item: Optional[ClothingItemSummary] = None

# --- OutfitHistory ---
class MarkWornRequest(BaseModel):
    top_item_id: Optional[UUID] = None
    bottom_item_id: Optional[UUID] = None
    footwear_item_id: Optional[UUID] = None
    accessory_item_id: Optional[UUID] = None
    occasion: Optional[str] = None
    weather: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None

class OutfitHistoryResponse(BaseModel):
    id: UUID
    occasion: Optional[str] = None
    weather: Optional[str] = None
    worn_date: datetime
    rating: Optional[int] = None
    notes: Optional[str] = None
    
    # Detailed items (injected by backend)
    top_item: Optional[ClothingItemSummary] = None
    bottom_item: Optional[ClothingItemSummary] = None
    footwear_item: Optional[ClothingItemSummary] = None
    accessory_item: Optional[ClothingItemSummary] = None
