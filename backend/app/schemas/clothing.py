from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ClothingItemBase(BaseModel):
    front_image_key: str
    back_image_key: Optional[str] = None
    label_image_key: Optional[str] = None
    thumbnail_key: Optional[str] = None
    
    type: str
    category: str
    brand: Optional[str] = None
    primary_color: str
    secondary_color: Optional[str] = None
    size: Optional[str] = None
    
    gender_fit: Optional[str] = None
    material: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    condition: Optional[str] = None
    
    usage_frequency: Optional[str] = None
    purchase_date: Optional[datetime] = None
    price_range: Optional[str] = None
    notes: Optional[str] = None

class ClothingItemCreate(ClothingItemBase):
    pass

class ClothingItemUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    size: Optional[str] = None
    gender_fit: Optional[str] = None
    material: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    condition: Optional[str] = None
    usage_frequency: Optional[str] = None
    purchase_date: Optional[datetime] = None
    price_range: Optional[str] = None
    notes: Optional[str] = None

class ClothingItemResponse(ClothingItemBase):
    id: UUID
    user_id: UUID
    ai_detected: bool
    ai_confidence: Optional[int]
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    
    # These will be dynamically injected by the API layer 
    # to provide temporary signed URLs for the frontend
    front_image_url: Optional[str] = None
    back_image_url: Optional[str] = None
    label_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
