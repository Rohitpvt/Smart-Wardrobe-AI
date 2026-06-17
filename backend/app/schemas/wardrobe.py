"""
Pydantic schemas for wardrobe operations.
"""

import uuid
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


class ClothingItemCreate(BaseModel):
    """Schema for creating a clothing item (metadata sent alongside the image upload)."""
    name: str = Field(..., max_length=255)
    clothing_type: str = Field(..., max_length=100)
    category: str = Field(..., max_length=50)
    color: str = Field(..., max_length=100)
    pattern: str | None = Field(None, max_length=100)
    material: str | None = Field(None, max_length=100)
    season: str | None = Field(None, max_length=50)
    brand: str | None = Field(None, max_length=100)
    notes: str | None = None
    ai_confidence: int | None = Field(None, ge=0, le=100)
    ai_generated: bool = False
    purchase_price: float | None = None
    purchase_date: date | None = None


class ClothingItemRead(BaseModel):
    """Schema for reading a clothing item."""
    id: uuid.UUID
    user_id: uuid.UUID
    image_url: str | None = None
    name: str
    clothing_type: str
    category: str
    color: str
    pattern: str | None = None
    material: str | None = None
    season: str | None = None
    brand: str | None = None
    notes: str | None = None
    ai_confidence: int | None = None
    ai_generated: bool
    purchase_price: float | None = None
    purchase_date: date | None = None
    worn_count: int
    last_worn_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClothingItemUpdate(BaseModel):
    """Schema for updating a clothing item's metadata (all fields optional)."""
    name: str | None = Field(None, max_length=255)
    clothing_type: str | None = Field(None, max_length=100)
    category: str | None = Field(None, max_length=50)
    color: str | None = Field(None, max_length=100)
    pattern: str | None = Field(None, max_length=100)
    material: str | None = Field(None, max_length=100)
    season: str | None = Field(None, max_length=50)
    brand: str | None = Field(None, max_length=100)
    notes: str | None = None
    purchase_price: float | None = None
    purchase_date: date | None = None


class PaginationMeta(BaseModel):
    """Pagination metadata included in list responses."""
    page: int
    page_size: int
    total_items: int
    total_pages: int


class ClothingItemListResponse(BaseModel):
    """Paginated list response for clothing items."""
    success: bool = True
    data: list[ClothingItemRead]
    pagination: PaginationMeta
