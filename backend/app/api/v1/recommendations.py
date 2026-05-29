"""
Outfit Recommendation API Endpoint.

POST /api/v1/recommendations/outfit
- Requires authentication
- Fetches user's active wardrobe
- Runs rule-based recommendation engine
- Returns scored outfit suggestions
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import logging

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.schemas.recommendation import OutfitRequest, OutfitRecommendationResponse
from app.recommendations.engine import generate_recommendation
from app.core.s3 import generate_presigned_url

logger = logging.getLogger(__name__)
recommendations_router = APIRouter()


def _model_to_dict(item: ClothingItem) -> dict:
    """Convert a SQLAlchemy ClothingItem model to a plain dict for the engine."""
    return {
        "id": str(item.id),
        "user_id": str(item.user_id),
        "front_image_key": item.front_image_key,
        "back_image_key": item.back_image_key,
        "type": item.type,
        "category": item.category,
        "brand": item.brand,
        "primary_color": item.primary_color,
        "secondary_color": item.secondary_color,
        "size": item.size,
        "gender_fit": item.gender_fit,
        "material": item.material,
        "season": item.season,
        "occasion": item.occasion,
        "condition": item.condition,
        "usage_frequency": item.usage_frequency,
        "is_deleted": item.is_deleted,
    }


def _inject_image_urls(result: dict) -> dict:
    """Inject presigned S3 URLs into all recommended items."""
    def _inject(item_dict: dict) -> dict:
        key = item_dict.get("front_image_key", "")
        if key:
            try:
                item_dict["front_image_url"] = generate_presigned_url(key)
            except Exception:
                item_dict["front_image_url"] = None
        return item_dict

    if result.get("selected_item"):
        _inject(result["selected_item"])

    for group_key in ["best_top_matches", "best_bottom_matches", "best_footwear_matches", "accessories_suggestions"]:
        for item in result.get(group_key, []):
            _inject(item)

    for avoid in result.get("avoid_combinations", []):
        if "item" in avoid:
            _inject(avoid["item"])

    return result


@recommendations_router.post("/outfit", response_model=OutfitRecommendationResponse)
async def generate_outfit_recommendation(
    request: OutfitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an outfit recommendation based on the user's wardrobe and context."""

    # 1. If a specific item is selected, verify ownership
    if request.selected_item_id:
        verify_result = await db.execute(
            select(ClothingItem).where(
                ClothingItem.id == request.selected_item_id,
                ClothingItem.user_id == current_user.id,
                ClothingItem.is_deleted == False,
            )
        )
        if not verify_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected clothing item not found or does not belong to you."
            )

    # 2. Fetch ALL active wardrobe items for this user
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.user_id == current_user.id,
            ClothingItem.is_deleted == False,
        )
    )
    items = result.scalars().all()

    if not items:
        return OutfitRecommendationResponse(
            explanation="Your wardrobe is empty. Upload some clothing items first to get outfit recommendations!",
            outfit_score=0,
            insufficient_wardrobe=True,
        )

    # 3. Convert models to dicts for the engine
    wardrobe_dicts = [_model_to_dict(item) for item in items]

    # 4. Run the recommendation engine
    recommendation = generate_recommendation(
        wardrobe_items=wardrobe_dicts,
        selected_item_id=request.selected_item_id,
        occasion=request.occasion,
        weather=request.weather,
        gender_style=request.gender_style,
        preferred_type=request.preferred_type,
        user_gender_preference=current_user.gender_preference,
    )

    # 5. Inject presigned S3 URLs for frontend image display
    recommendation = _inject_image_urls(recommendation)

    return recommendation
