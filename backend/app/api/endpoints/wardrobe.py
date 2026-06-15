"""
Wardrobe API endpoints.

Provides CRUD operations for clothing items with image upload support.
All endpoints require authentication.
"""

import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import User
from app.schemas import (
    ClothingItemCreate,
    ClothingItemRead,
    ClothingItemUpdate,
    ClothingItemListResponse,
)
from app.api.dependencies import get_current_user
from app.services.storage import local as storage_service
from app.services import wardrobe as wardrobe_service

router = APIRouter()


@router.post("", response_model=ClothingItemRead, status_code=status.HTTP_201_CREATED)
async def create_clothing_item(
    image: UploadFile = File(...),
    name: str = Form(..., max_length=255),
    clothing_type: str = Form(..., max_length=100),
    category: str = Form(..., max_length=50),
    color: str = Form(..., max_length=100),
    pattern: str | None = Form(None, max_length=100),
    material: str | None = Form(None, max_length=100),
    season: str | None = Form(None, max_length=50),
    brand: str | None = Form(None, max_length=100),
    notes: str | None = Form(None),
    ai_confidence: int | None = Form(None, ge=0, le=100),
    ai_generated: bool = Form(False),
    purchase_price: float | None = Form(None, ge=0),
    purchase_date: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload an image and create a new clothing item."""
    # Validate the uploaded file
    storage_service.validate_upload(image)

    # Save the file (includes EXIF stripping)
    image_url = await storage_service.save_upload(image, current_user.id)

    # Create the database record
    item = await wardrobe_service.create_item(
        db=db,
        user_id=current_user.id,
        image_url=image_url,
        name=name,
        clothing_type=clothing_type,
        category=category,
        color=color,
        pattern=pattern,
        material=material,
        season=season,
        brand=brand,
        notes=notes,
        ai_confidence=ai_confidence,
        ai_generated=ai_generated,
        purchase_price=purchase_price,
        purchase_date=purchase_date,
    )
    return item


@router.get("", response_model=ClothingItemListResponse)
async def list_clothing_items(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search across name, type, category, color, pattern, material, season, brand"),
    category: str | None = Query(None, description="Filter by category"),
    color: str | None = Query(None, description="Filter by color"),
    season: str | None = Query(None, description="Filter by season"),
    clothing_type: str | None = Query(None, description="Filter by clothing type"),
    sort_by: str = Query("created_at", description="Sort field: created_at, name, category, color"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List clothing items with pagination, search, filters, and sorting."""
    result = await wardrobe_service.list_items(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        color=color,
        season=season,
        clothing_type=clothing_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ClothingItemListResponse(
        success=True,
        data=result["items"],
        pagination=result["pagination"],
    )


@router.get("/{item_id}", response_model=ClothingItemRead)
async def get_clothing_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single clothing item by ID. User must own the item."""
    item = await wardrobe_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")
    return item


@router.put("/{item_id}", response_model=ClothingItemRead)
async def update_clothing_item(
    item_id: uuid.UUID,
    item_update: ClothingItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a clothing item's metadata. User must own the item."""
    item = await wardrobe_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")

    update_data = item_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    updated = await wardrobe_service.update_item(db, item, update_data)
    return updated


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clothing_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a clothing item and its associated image. User must own the item."""
    item = await wardrobe_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")

    await wardrobe_service.delete_item(db, item)

@router.post("/{item_id}/wear", response_model=ClothingItemRead)
async def log_item_wear(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log that an item was worn, incrementing worn_count and updating last_worn_at."""
    from datetime import datetime, timezone
    
    item = await wardrobe_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")

    update_data = {
        "worn_count": item.worn_count + 1,
        "last_worn_at": datetime.now(timezone.utc)
    }
    updated = await wardrobe_service.update_item(db, item, update_data)
    return updated
