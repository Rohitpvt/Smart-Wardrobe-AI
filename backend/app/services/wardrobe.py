"""
Wardrobe business logic service.

Provides CRUD operations, pagination, search, filter, and sort for clothing items.
Follows TRD §14: business logic must not live in route handlers.
"""

import uuid
import math
import logging
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ClothingItem
from app.services.storage import local as storage_service

logger = logging.getLogger(__name__)

# Fields eligible for ILIKE search
SEARCH_FIELDS = [
    ClothingItem.name,
    ClothingItem.clothing_type,
    ClothingItem.category,
    ClothingItem.color,
    ClothingItem.pattern,
    ClothingItem.material,
    ClothingItem.season,
    ClothingItem.brand,
]

# Fields eligible for sorting
SORTABLE_FIELDS = {
    "created_at": ClothingItem.created_at,
    "name": ClothingItem.name,
    "category": ClothingItem.category,
    "color": ClothingItem.color,
}


async def create_item(
    db: AsyncSession,
    user_id: uuid.UUID,
    image_url: str,
    ai_confidence: int | None = None,
    ai_generated: bool = False,
    **kwargs: Any,
) -> ClothingItem:
    """Create a new clothing item record in the database."""
    item = ClothingItem(
        user_id=user_id,
        image_url=image_url,
        ai_confidence=ai_confidence,
        ai_generated=ai_generated,
        **kwargs,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    logger.info(f"Created clothing item {item.id} for user {user_id}")
    return item


async def get_item(
    db: AsyncSession,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
) -> ClothingItem | None:
    """Fetch a single clothing item, verifying ownership."""
    stmt = select(ClothingItem).where(
        ClothingItem.id == item_id,
        ClothingItem.user_id == user_id,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_items(
    db: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    category: str | None = None,
    color: str | None = None,
    season: str | None = None,
    clothing_type: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    """
    List clothing items with pagination, search, filters, and sorting.
    Returns dict with 'items' and 'pagination' keys.
    """
    # Base query scoped to user
    base = select(ClothingItem).where(ClothingItem.user_id == user_id)
    count_base = select(func.count(ClothingItem.id)).where(ClothingItem.user_id == user_id)

    # Apply search (ILIKE across multiple fields)
    if search:
        search_term = f"%{search}%"
        search_conditions = [field.ilike(search_term) for field in SEARCH_FIELDS]
        base = base.where(or_(*search_conditions))
        count_base = count_base.where(or_(*search_conditions))

    # Apply filters
    if category:
        base = base.where(ClothingItem.category == category)
        count_base = count_base.where(ClothingItem.category == category)
    if color:
        base = base.where(ClothingItem.color.ilike(color))
        count_base = count_base.where(ClothingItem.color.ilike(color))
    if season:
        base = base.where(ClothingItem.season == season)
        count_base = count_base.where(ClothingItem.season == season)
    if clothing_type:
        base = base.where(ClothingItem.clothing_type.ilike(clothing_type))
        count_base = count_base.where(ClothingItem.clothing_type.ilike(clothing_type))

    # Count total
    total_result = await db.execute(count_base)
    total_items = total_result.scalar() or 0
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0

    # Apply sorting
    sort_column = SORTABLE_FIELDS.get(sort_by, ClothingItem.created_at)
    if sort_order == "asc":
        base = base.order_by(sort_column.asc())
    else:
        base = base.order_by(sort_column.desc())

    # Apply pagination
    offset = (page - 1) * page_size
    base = base.offset(offset).limit(page_size)

    result = await db.execute(base)
    items = result.scalars().all()

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        },
    }


async def update_item(
    db: AsyncSession,
    item: ClothingItem,
    update_data: dict,
) -> ClothingItem:
    """Update a clothing item's metadata."""
    for field, value in update_data.items():
        setattr(item, field, value)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    logger.info(f"Updated clothing item {item.id}")
    return item


async def delete_item(
    db: AsyncSession,
    item: ClothingItem,
) -> None:
    """Delete a clothing item and its associated image file."""
    image_url = item.image_url
    await db.delete(item)
    await db.commit()
    # Delete file after successful DB commit
    storage_service.delete_upload(image_url)
    logger.info(f"Deleted clothing item {item.id}")
