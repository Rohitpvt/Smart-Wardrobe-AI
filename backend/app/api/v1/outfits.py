"""
Outfits API.

POST /api/v1/outfits/save       - Save an outfit
GET  /api/v1/outfits/saved      - List saved outfits
POST /api/v1/outfits/mark-worn  - Add to history and update usage count
GET  /api/v1/outfits/history    - List outfit history
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
import logging
from datetime import datetime, timezone

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.outfit import SavedOutfit, OutfitHistory
from app.schemas.outfit import SavedOutfitCreate, SavedOutfitResponse, MarkWornRequest, OutfitHistoryResponse, ClothingItemSummary
from app.core.s3 import generate_presigned_url

logger = logging.getLogger(__name__)
outfits_router = APIRouter()


async def _verify_items_ownership(db: AsyncSession, user_id, item_ids: list):
    """Verify that all provided item IDs belong to the user and are not deleted."""
    ids_to_check = [i for i in item_ids if i is not None]
    if not ids_to_check:
        return

    result = await db.execute(
        select(ClothingItem.id).where(
            ClothingItem.id.in_(ids_to_check),
            ClothingItem.user_id == user_id,
            ClothingItem.is_deleted == False
        )
    )
    found_ids = {str(row) for row in result.scalars().all()}
    
    missing_ids = [str(i) for i in ids_to_check if str(i) not in found_ids]
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"One or more clothing items not found or do not belong to you: {', '.join(missing_ids)}"
        )


def _build_item_summary(item_id, item_model: ClothingItem) -> ClothingItemSummary:
    """Helper to safely build summary, injecting presigned URL."""
    if not item_model or str(item_model.id) != str(item_id):
        return None
    url = None
    if item_model.front_image_key:
        try:
            url = generate_presigned_url(item_model.front_image_key)
        except Exception:
            pass
    return ClothingItemSummary(
        id=item_model.id,
        type=item_model.type,
        category=item_model.category,
        primary_color=item_model.primary_color,
        front_image_url=url
    )

def _get_item_from_list(item_id, items_list):
    """Find the specific item model in a list."""
    if not item_id:
        return None
    for item in items_list:
        if str(item.id) == str(item_id):
            return item
    return None


@outfits_router.post("/save", response_model=SavedOutfitResponse)
async def save_outfit(
    request: SavedOutfitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save an outfit to the user's collection."""
    # Verify ownership of all passed IDs
    await _verify_items_ownership(db, current_user.id, [
        request.top_item_id, request.bottom_item_id,
        request.footwear_item_id, request.accessory_item_id
    ])

    new_outfit = SavedOutfit(
        user_id=current_user.id,
        name=request.name,
        top_item_id=request.top_item_id,
        bottom_item_id=request.bottom_item_id,
        footwear_item_id=request.footwear_item_id,
        accessory_item_id=request.accessory_item_id,
        occasion=request.occasion,
        season=request.season,
        notes=request.notes
    )
    db.add(new_outfit)
    await db.commit()
    await db.refresh(new_outfit)

    # We just return the outfit without fully loaded items to save an extra query right away,
    # or we can do a lazy load by just returning the dict structure. The Pydantic model allows None items.
    return new_outfit


@outfits_router.get("/saved", response_model=List[SavedOutfitResponse])
async def list_saved_outfits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all saved outfits with their item summaries."""
    result = await db.execute(
        select(SavedOutfit)
        .where(SavedOutfit.user_id == current_user.id)
        .order_by(SavedOutfit.created_at.desc())
    )
    outfits = result.scalars().all()

    # Collect all needed item IDs
    item_ids = set()
    for o in outfits:
        if o.top_item_id: item_ids.add(o.top_item_id)
        if o.bottom_item_id: item_ids.add(o.bottom_item_id)
        if o.footwear_item_id: item_ids.add(o.footwear_item_id)
        if o.accessory_item_id: item_ids.add(o.accessory_item_id)

    # Fetch all items in one query
    items_list = []
    if item_ids:
        items_result = await db.execute(
            select(ClothingItem).where(ClothingItem.id.in_(list(item_ids)))
        )
        items_list = items_result.scalars().all()

    # Build response
    response_data = []
    for o in outfits:
        response_data.append({
            "id": o.id,
            "name": o.name,
            "occasion": o.occasion,
            "season": o.season,
            "notes": o.notes,
            "created_at": o.created_at,
            "top_item": _build_item_summary(o.top_item_id, _get_item_from_list(o.top_item_id, items_list)),
            "bottom_item": _build_item_summary(o.bottom_item_id, _get_item_from_list(o.bottom_item_id, items_list)),
            "footwear_item": _build_item_summary(o.footwear_item_id, _get_item_from_list(o.footwear_item_id, items_list)),
            "accessory_item": _build_item_summary(o.accessory_item_id, _get_item_from_list(o.accessory_item_id, items_list)),
        })

    return response_data


@outfits_router.post("/mark-worn", response_model=OutfitHistoryResponse)
async def mark_outfit_worn(
    request: MarkWornRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Log an outfit as worn and increment usage counts."""
    
    item_ids = [
        request.top_item_id, request.bottom_item_id,
        request.footwear_item_id, request.accessory_item_id
    ]
    await _verify_items_ownership(db, current_user.id, item_ids)

    now = datetime.now(timezone.utc)

    # 1. Create history record
    new_history = OutfitHistory(
        user_id=current_user.id,
        top_item_id=request.top_item_id,
        bottom_item_id=request.bottom_item_id,
        footwear_item_id=request.footwear_item_id,
        accessory_item_id=request.accessory_item_id,
        occasion=request.occasion,
        weather=request.weather,
        worn_date=now,
        rating=request.rating,
        notes=request.notes
    )
    db.add(new_history)

    # 2. Update wear_count and last_worn_at on ClothingItems
    valid_ids = [i for i in item_ids if i is not None]
    if valid_ids:
        items_result = await db.execute(
            select(ClothingItem).where(ClothingItem.id.in_(valid_ids))
        )
        items_to_update = items_result.scalars().all()
        for item in items_to_update:
            item.wear_count += 1
            item.last_worn_at = now

    await db.commit()
    await db.refresh(new_history)

    return new_history


@outfits_router.get("/history", response_model=List[OutfitHistoryResponse])
async def list_outfit_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all outfit history records with their item summaries, newest first."""
    result = await db.execute(
        select(OutfitHistory)
        .where(OutfitHistory.user_id == current_user.id)
        .order_by(OutfitHistory.worn_date.desc())
    )
    history = result.scalars().all()

    # Collect all needed item IDs
    item_ids = set()
    for h in history:
        if h.top_item_id: item_ids.add(h.top_item_id)
        if h.bottom_item_id: item_ids.add(h.bottom_item_id)
        if h.footwear_item_id: item_ids.add(h.footwear_item_id)
        if h.accessory_item_id: item_ids.add(h.accessory_item_id)

    # Fetch all items
    items_list = []
    if item_ids:
        items_result = await db.execute(
            select(ClothingItem).where(ClothingItem.id.in_(list(item_ids)))
        )
        items_list = items_result.scalars().all()

    # Build response
    response_data = []
    for h in history:
        response_data.append({
            "id": h.id,
            "occasion": h.occasion,
            "weather": h.weather,
            "worn_date": h.worn_date,
            "rating": h.rating,
            "notes": h.notes,
            "top_item": _build_item_summary(h.top_item_id, _get_item_from_list(h.top_item_id, items_list)),
            "bottom_item": _build_item_summary(h.bottom_item_id, _get_item_from_list(h.bottom_item_id, items_list)),
            "footwear_item": _build_item_summary(h.footwear_item_id, _get_item_from_list(h.footwear_item_id, items_list)),
            "accessory_item": _build_item_summary(h.accessory_item_id, _get_item_from_list(h.accessory_item_id, items_list)),
        })

    return response_data
