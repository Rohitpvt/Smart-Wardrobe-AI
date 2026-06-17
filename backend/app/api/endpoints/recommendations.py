import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.user import User
from app.models.outfit_recommendation import OutfitRecommendation
from app.schemas.recommendation import (
    RecommendationGenerateRequest,
    OutfitRecommendationResponse,
    OutfitRecommendationListResponse,
    WeatherSnapshot,
)
from app.core.config import settings
from app.schemas.wardrobe import PaginationMeta
from app.services.recommendations.engine import outfit_engine, RecommendationError
from app.services.recommendations.outfit_scoring import outfit_scoring_engine
from app.services.weather.provider import weather_service
from app.services.ai import ai_provider
from app.services.feedback_service import feedback_service
from app.services.preference_learning_service import preference_learning_service
from app.services.recommendation_reranker import recommendation_reranker
from app.services.recommendations.completion_engine import outfit_completion_engine
from app.models.user_preference import UserPreference
from app.models.clothing_item import ClothingItem
from app.schemas.recommendation import FeedbackRequest, FeedbackRead, FeedbackHistoryResponse
from app.schemas.completion import CompletionBuildRequest, OutfitCompletionResponse
from app.services.recommendations.recommendation_service import recommendation_service
from app.schemas.recommendation_explanation import (
    ExplainableRecommendationRequest,
    ExplainableRecommendationResponse
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/generate", response_model=OutfitRecommendationResponse, status_code=201)
@limiter.limit(settings.RATE_LIMIT_RECOMMENDATIONS)
async def generate_recommendation(
    request: Request,
    body: RecommendationGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an outfit recommendation based on rules.
    """
    # 1. Fetch Weather
    weather_ctx = await weather_service.get_current_weather(
        current_user.city, current_user.country_code
    )

    # 2. Rule-Based Engine Generation
    try:
        top, bottom, shoes = await outfit_engine.generate_outfit(
            session=db,
            user_id=current_user.id,
            occasion=body.occasion,
            weather=weather_ctx
        )
    except RecommendationError as e:
        raise HTTPException(
            status_code=422,
            detail={"error_code": e.error_code, "message": str(e)}
        )
        
    # 3. Score generation
    scores = outfit_scoring_engine.score_outfit(
        top=top,
        bottom=bottom,
        footwear=shoes,
        occasion=body.occasion,
        weather=weather_ctx
    )
    
    # 4. AI Explanation Generation
    ai_explanation = await ai_provider.generate_outfit_explanation(
        top_name=top.name,
        bottom_name=bottom.name,
        footwear_name=shoes.name,
        occasion=body.occasion,
        weather=weather_ctx.model_dump() if weather_ctx.weather_used else None,
        scores=scores
    )

    # 5. Persistence
    db_rec = OutfitRecommendation(
        user_id=current_user.id,
        top_item_id=top.id,
        bottom_item_id=bottom.id,
        footwear_item_id=shoes.id,
        occasion=body.occasion,
        ai_explanation=ai_explanation,
        weather_snapshot=weather_ctx.model_dump() if weather_ctx.weather_used else None,
        overall_score=scores.get("overall_score"),
        color_score=scores.get("color_score"),
        weather_score=scores.get("weather_score"),
        occasion_score=scores.get("occasion_score"),
        season_score=scores.get("season_score"),
        utilization_score=scores.get("utilization_score"),
        score_metadata=scores.get("score_metadata")
    )
    db.add(db_rec)
    await db.commit()
    await db.refresh(db_rec)

    # 6. Apply Reranking
    preferences = await preference_learning_service.learn_preferences(db, current_user.id)
    outfit_dict = {
        "top_item": top,
        "bottom_item": bottom,
        "footwear_item": shoes,
        "scores": scores
    }
    reranked = recommendation_reranker.rerank_outfits([outfit_dict], preferences)[0]

    # Eager load isn't automatic, so we attach the objects to the response explicitly
    return OutfitRecommendationResponse(
        success=True,
        data={
            "id": db_rec.id,
            "user_id": db_rec.user_id,
            "occasion": db_rec.occasion,
            "top_item": top,
            "bottom_item": bottom,
            "footwear_item": shoes,
            "ai_explanation": db_rec.ai_explanation,
            "weather_snapshot": weather_ctx,
            "scores": reranked["scores"],
            "created_at": db_rec.created_at,
            "updated_at": db_rec.updated_at
        }
    )

@router.post("/explainable", response_model=ExplainableRecommendationResponse, status_code=200)
@limiter.limit(settings.RATE_LIMIT_RECOMMENDATIONS)
async def generate_explainable_recommendation(
    request: Request,
    body: ExplainableRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an explainable AI recommendation (standard or anchor modes).
    """
    # Fetch weather
    weather_ctx = await weather_service.get_current_weather(
        current_user.city, current_user.country_code
    )

    anchor_item = None
    if body.generation_mode == "anchor" and body.anchor_item_id:
        anchor_query = await db.execute(
            select(ClothingItem).where(
                ClothingItem.id == body.anchor_item_id,
                ClothingItem.user_id == current_user.id
            )
        )
        anchor_item = anchor_query.scalar_one_or_none()
        if not anchor_item:
            raise HTTPException(status_code=404, detail="Anchor item not found.")

    try:
        recommendations = await recommendation_service.generate_explainable_recommendations(
            session=db,
            user_id=current_user.id,
            occasion=body.occasion,
            weather=weather_ctx,
            generation_mode=body.generation_mode,
            anchor_item=anchor_item
        )
    except RecommendationError as e:
        raise HTTPException(
            status_code=422,
            detail={"error_code": e.error_code, "message": str(e)}
        )

    return ExplainableRecommendationResponse(
        recommendations=recommendations
    )


@router.post("/build-around", response_model=OutfitCompletionResponse, status_code=200)
@limiter.limit(settings.RATE_LIMIT_RECOMMENDATIONS)
async def build_around_anchor(
    request: Request,
    body: CompletionBuildRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Build a complete outfit around an existing anchor item.
    """
    # 1. Fetch anchor item
    anchor_query = await db.execute(
        select(ClothingItem).where(
            ClothingItem.id == body.anchor_item_id,
            ClothingItem.user_id == current_user.id
        )
    )
    anchor_item = anchor_query.scalar_one_or_none()
    if not anchor_item:
        raise HTTPException(status_code=404, detail="Anchor item not found in wardrobe.")

    # 2. Fetch User Styling Preference
    pref_query = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = pref_query.scalar_one_or_none()
    styling_preference = pref.styling_preference if pref else "neutral"

    # 3. Fetch Weather
    weather_ctx = await weather_service.get_current_weather(
        current_user.city, current_user.country_code
    )

    # 4. Engine Generation
    try:
        top, bottom, shoes, outerwear, scores = await outfit_completion_engine.build_around_anchor(
            session=db,
            user_id=current_user.id,
            anchor_item=anchor_item,
            occasion=body.occasion,
            weather=weather_ctx
        )
    except RecommendationError as e:
        raise HTTPException(
            status_code=422,
            detail={"error_code": e.error_code, "message": str(e)}
        )
        
    # 5. Gemini Accessories & Reasoning
    gemini_resp = await ai_provider.generate_outfit_completion_accessories(
        top_name=top.name,
        bottom_name=bottom.name,
        footwear_name=shoes.name,
        outerwear_name=outerwear.name if outerwear else None,
        anchor_type=anchor_item.category,
        styling_preference=styling_preference
    )
    
    # 6. Overall backend confidence is the overall_score
    confidence = scores.get("overall_score", 85)

    return OutfitCompletionResponse(
        success=True,
        data={
            "anchor_item": anchor_item,
            "top_item": top,
            "bottom_item": bottom,
            "footwear_item": shoes,
            "outerwear_item": outerwear,
            "accessories": gemini_resp.get("accessories", {}),
            "reasoning": gemini_resp.get("reasoning", "A balanced aesthetic for your anchor item."),
            "confidence_score": confidence,
            "scores": scores
        }
    )

@router.get("", response_model=OutfitRecommendationListResponse)
async def list_recommendations(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated history of outfit recommendations.
    """
    page_size = min(max(1, page_size), 100)
    page = max(1, page)
    offset = (page - 1) * page_size
    
    # Eager load the clothing items
    from sqlalchemy.orm import selectinload
    
    query = (
        select(OutfitRecommendation)
        .where(OutfitRecommendation.user_id == current_user.id)
        .options(
            selectinload(OutfitRecommendation.top_item),
            selectinload(OutfitRecommendation.bottom_item),
            selectinload(OutfitRecommendation.footwear_item)
        )
        .order_by(desc(OutfitRecommendation.created_at))
        .limit(page_size)
        .offset(offset)
    )
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    count_query = select(func.count()).where(OutfitRecommendation.user_id == current_user.id)
    total_items = await db.scalar(count_query) or 0
    total_pages = (total_items + page_size - 1) // page_size
    preferences = await preference_learning_service.learn_preferences(db, current_user.id)
    
    outfits = []
    for rec in items:
        outfit_dict = {
            "top_item": rec.top_item,
            "bottom_item": rec.bottom_item,
            "footwear_item": rec.footwear_item,
            "scores": {
                "overall_score": rec.overall_score,
                "color_score": rec.color_score,
                "weather_score": rec.weather_score,
                "occasion_score": rec.occasion_score,
                "season_score": rec.season_score,
                "utilization_score": rec.utilization_score,
                "score_metadata": rec.score_metadata
            },
            "rec": rec
        }
        outfits.append(outfit_dict)
        
    reranked_outfits = recommendation_reranker.rerank_outfits(outfits, preferences)
    
    return OutfitRecommendationListResponse(
        success=True,
        data=[
            {
                "id": o["rec"].id,
                "user_id": o["rec"].user_id,
                "occasion": o["rec"].occasion,
                "top_item": o["top_item"],
                "bottom_item": o["bottom_item"],
                "footwear_item": o["footwear_item"],
                "ai_explanation": o["rec"].ai_explanation,
                "weather_snapshot": o["rec"].weather_snapshot,
                "scores": o["scores"],
                "created_at": o["rec"].created_at,
                "updated_at": o["rec"].updated_at
            }
            for o in reranked_outfits
        ],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages
        )
    )

@router.delete("/{id}", status_code=204)
async def delete_recommendation(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific recommendation.
    """
    query = select(OutfitRecommendation).where(
        OutfitRecommendation.id == id,
        OutfitRecommendation.user_id == current_user.id
    )
    result = await db.execute(query)
    rec = result.scalar_one_or_none()
    
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    await db.delete(rec)
    await db.commit()

@router.post("/{id}/feedback", response_model=FeedbackRead, status_code=201)
async def submit_feedback(
    id: uuid.UUID,
    body: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit feedback for a specific outfit recommendation.
    """
    # Verify outfit exists and belongs to user
    query = select(OutfitRecommendation).where(
        OutfitRecommendation.id == id,
        OutfitRecommendation.user_id == current_user.id
    )
    result = await db.execute(query)
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    fb = await feedback_service.record_feedback(
        session=db,
        user_id=current_user.id,
        outfit_id=id,
        feedback_type=body.feedback_type,
        source="manual"
    )
    return fb

@router.get("/feedback/history", response_model=FeedbackHistoryResponse)
async def get_feedback_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent feedback history.
    """
    history = await feedback_service.get_feedback_history(
        session=db,
        user_id=current_user.id,
        limit=limit
    )
    return FeedbackHistoryResponse(success=True, data=history)
