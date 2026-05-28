from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from typing import Any, List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.schemas.clothing import ClothingItemCreate, ClothingItemUpdate, ClothingItemResponse
from app.core.dependencies import get_current_user
from app.core.s3 import generate_presigned_url

clothing_router = APIRouter()

def inject_presigned_urls(item: ClothingItem) -> None:
    """Mutates item to add temporary signed URLs for frontend display."""
    item.front_image_url = generate_presigned_url(item.front_image_key) if item.front_image_key else None
    item.back_image_url = generate_presigned_url(item.back_image_key) if item.back_image_key else None
    item.label_image_url = generate_presigned_url(item.label_image_key) if item.label_image_key else None
    item.thumbnail_url = generate_presigned_url(item.thumbnail_key) if item.thumbnail_key else None

@clothing_router.post("", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
async def create_clothing_item(
    item_in: ClothingItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new clothing item.
    """
    db_item = ClothingItem(
        user_id=current_user.id,
        **item_in.model_dump()
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    inject_presigned_urls(db_item)
    return db_item

@clothing_router.get("", response_model=List[ClothingItemResponse])
async def list_clothing_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    type: Optional[str] = None,
    category: Optional[str] = None,
    primary_color: Optional[str] = None,
    season: Optional[str] = None,
    occasion: Optional[str] = None,
    condition: Optional[str] = None,
    usage_frequency: Optional[str] = None,
    material: Optional[str] = None,
    gender_fit: Optional[str] = None,
    search: Optional[str] = None
) -> Any:
    """
    Get all non-deleted clothing items for the current user, with optional filtering.
    """
    query = select(ClothingItem).where(
        and_(
            ClothingItem.user_id == current_user.id,
            ClothingItem.is_deleted == False
        )
    )
    
    # Exact match filters
    if type: query = query.where(ClothingItem.type == type)
    if category: query = query.where(ClothingItem.category == category)
    if primary_color: query = query.where(ClothingItem.primary_color == primary_color)
    if season: query = query.where(ClothingItem.season == season)
    if occasion: query = query.where(ClothingItem.occasion == occasion)
    if condition: query = query.where(ClothingItem.condition == condition)
    if usage_frequency: query = query.where(ClothingItem.usage_frequency == usage_frequency)
    if material: query = query.where(ClothingItem.material == material)
    if gender_fit: query = query.where(ClothingItem.gender_fit == gender_fit)
    
    # Text search
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                ClothingItem.type.ilike(search_pattern),
                ClothingItem.category.ilike(search_pattern),
                ClothingItem.brand.ilike(search_pattern),
                ClothingItem.primary_color.ilike(search_pattern),
                ClothingItem.notes.ilike(search_pattern)
            )
        )
        
    result = await db.execute(query)
    items = result.scalars().all()
    
    for item in items:
        inject_presigned_urls(item)
        
    return items

@clothing_router.get("/{id}", response_model=ClothingItemResponse)
async def get_clothing_item(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get details of a specific clothing item. Ensures user owns the item.
    """
    result = await db.execute(
        select(ClothingItem).where(
            and_(
                ClothingItem.id == id,
                ClothingItem.user_id == current_user.id,
                ClothingItem.is_deleted == False
            )
        )
    )
    item = result.scalars().first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")
        
    inject_presigned_urls(item)
    return item

@clothing_router.put("/{id}", response_model=ClothingItemResponse)
async def update_clothing_item(
    id: uuid.UUID,
    item_in: ClothingItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a clothing item.
    """
    result = await db.execute(
        select(ClothingItem).where(
            and_(
                ClothingItem.id == id,
                ClothingItem.user_id == current_user.id,
                ClothingItem.is_deleted == False
            )
        )
    )
    item = result.scalars().first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
        
    await db.commit()
    await db.refresh(item)
    inject_presigned_urls(item)
    return item

@clothing_router.delete("/{id}")
async def delete_clothing_item(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Soft delete a clothing item.
    """
    result = await db.execute(
        select(ClothingItem).where(
            and_(
                ClothingItem.id == id,
                ClothingItem.user_id == current_user.id,
                ClothingItem.is_deleted == False
            )
        )
    )
    item = result.scalars().first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clothing item not found")
        
    item.is_deleted = True
    await db.commit()
    
    return {"message": "Clothing item deleted successfully"}
