import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, cast, Date, Integer

from app.models.clothing_item import ClothingItem
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.wardrobe_gap_service import wardrobe_gap_service
from app.services.wear_analytics import wear_analytics_service
from app.services.rotation_engine import rotation_engine
from app.services.style_dna_service import style_dna_service
from app.services.purchase_recommendation_service import purchase_recommendation_service

async def get_dashboard_summary(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Aggregates all dashboard metrics using efficient database queries."""
    
    # 1. Total counts & averages
    stmt = select(
        func.count(ClothingItem.id).label('total_items'),
        func.count(func.distinct(ClothingItem.category)).label('categories'),
        func.count(func.distinct(ClothingItem.color)).label('unique_colors'),
        func.count(func.distinct(ClothingItem.brand)).label('unique_brands'),
        func.sum(cast(ClothingItem.ai_generated, Integer)).label('ai_generated_items'),
        func.avg(ClothingItem.ai_confidence).label('average_ai_confidence')
    ).where(ClothingItem.user_id == user_id)
    
    result = await session.execute(stmt)
    row = result.first()
    
    total_items = row.total_items or 0
    ai_generated_items = int(row.ai_generated_items or 0) if row and row.ai_generated_items else 0
    manual_items = total_items - ai_generated_items
    
    # 2. Category Distribution
    stmt_cat = select(ClothingItem.category, func.count(ClothingItem.id)).where(ClothingItem.user_id == user_id).group_by(ClothingItem.category)
    cats_result = await session.execute(stmt_cat)
    category_dist = [{"name": c, "count": cnt} for c, cnt in cats_result.all()]
    
    # 3. Color Distribution
    stmt_col = select(ClothingItem.color, func.count(ClothingItem.id)).where(ClothingItem.user_id == user_id).group_by(ClothingItem.color)
    cols_result = await session.execute(stmt_col)
    color_dist = [{"name": c, "count": cnt} for c, cnt in cols_result.all()]
    
    # 4. Season Distribution (ignore nulls)
    stmt_sea = select(ClothingItem.season, func.count(ClothingItem.id)).where(
        and_(ClothingItem.user_id == user_id, ClothingItem.season.isnot(None))
    ).group_by(ClothingItem.season)
    sea_result = await session.execute(stmt_sea)
    season_dist = [{"name": s, "count": cnt} for s, cnt in sea_result.all()]
    
    # 5. Brand Distribution (Top 10)
    stmt_br = select(ClothingItem.brand, func.count(ClothingItem.id)).where(
        and_(ClothingItem.user_id == user_id, ClothingItem.brand.isnot(None))
    ).group_by(ClothingItem.brand).order_by(desc(func.count(ClothingItem.id))).limit(10)
    br_result = await session.execute(stmt_br)
    brand_dist = [{"name": b, "count": cnt} for b, cnt in br_result.all()]
    
    # 6. Metadata Completeness
    # COUNT(col) safely ignores NULL values natively in SQL
    stmt_meta = select(
        func.count(ClothingItem.material).label("materials"),
        func.count(ClothingItem.pattern).label("patterns"),
        func.count(ClothingItem.season).label("seasons"),
        func.count(ClothingItem.brand).label("brands"),
    ).where(ClothingItem.user_id == user_id)
    meta_result = await session.execute(stmt_meta)
    meta_row = meta_result.first()
    
    if meta_row:
        filled_fields = (meta_row.materials or 0) + (meta_row.patterns or 0) + (meta_row.seasons or 0) + (meta_row.brands or 0)
    else:
        filled_fields = 0
        
    total_fields = total_items * 4
    metadata_percentage = int((filled_fields / total_fields) * 100) if total_fields > 0 else 0
    
    # 7. Recent Items
    stmt_recent = select(ClothingItem).where(ClothingItem.user_id == user_id).order_by(desc(ClothingItem.created_at)).limit(5)
    recent_result = await session.execute(stmt_recent)
    recent_items = [item for item in recent_result.scalars().all()]
    
    # 8. Category Balance
    category_balance = {}
    imbalance_flag = False
    for item in category_dist:
        pct = item["count"] / total_items if total_items > 0 else 0
        category_balance[item["name"]] = pct
        if pct > 0.6:
            imbalance_flag = True
            
    ai_coverage_percentage = int((ai_generated_items / total_items) * 100) if total_items > 0 else 0

    return {
        "total_items": total_items,
        "categories": row.categories or 0 if row else 0,
        "unique_colors": row.unique_colors or 0 if row else 0,
        "unique_brands": row.unique_brands or 0 if row else 0,
        "ai_generated_items": ai_generated_items,
        "manual_items": manual_items,
        "average_ai_confidence": int(row.average_ai_confidence or 0) if row else 0,
        "health_metrics": {
            "ai_coverage_percentage": ai_coverage_percentage,
            "metadata_completeness_percentage": metadata_percentage,
            "category_balance": category_balance,
            "imbalance_flag": imbalance_flag,
        },
        "category_distribution": category_dist,
        "color_distribution": color_dist,
        "season_distribution": season_dist,
        "brand_distribution": brand_dist,
        "recent_items": recent_items,
    }

async def get_confidence_trend(session: AsyncSession, user_id: uuid.UUID, days: int = 30) -> List[dict]:
    """Retrieves average confidence grouped by date for trend lines."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    stmt = select(
        cast(ClothingItem.created_at, Date).label("upload_date"),
        func.avg(ClothingItem.ai_confidence).label("avg_conf")
    ).where(
        and_(
            ClothingItem.user_id == user_id,
            ClothingItem.ai_confidence.isnot(None),
            ClothingItem.created_at >= cutoff_date
        )
    ).group_by(
        cast(ClothingItem.created_at, Date)
    ).order_by(
        cast(ClothingItem.created_at, Date)
    )
    
    result = await session.execute(stmt)
    trend = []
    for row in result.all():
        trend.append({
            "date": row.upload_date.isoformat(),
            "average_confidence": int(row.avg_conf or 0)
        })
    return trend

async def get_dashboard_intelligence(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Retrieves Phase 6A Advanced AI Intelligence metrics."""
    
    # 1. Wardrobe Health (Gap Analysis)
    health_report = await wardrobe_gap_service.analyze(session, str(user_id))
    
    # 2. Cost-Per-Wear Economics
    stmt_items = select(ClothingItem).where(ClothingItem.user_id == user_id)
    result_items = await session.execute(stmt_items)
    items = result_items.scalars().all()
    
    total_wears = 0
    total_investment = 0.0
    
    most_valuable_item = None
    least_utilized_item = None
    lowest_cpw = float('inf')
    highest_cpw = 0.0
    
    for item in items:
        total_wears += item.worn_count
        price = item.purchase_price or 0.0
        total_investment += price
        
        if price > 0:
            cpw = price / max(item.worn_count, 1)
            # Most valuable = lowest CPW
            if cpw < lowest_cpw:
                lowest_cpw = cpw
                most_valuable_item = item
            # Least utilized = highest CPW
            if cpw > highest_cpw:
                highest_cpw = cpw
                least_utilized_item = item
                
    average_cost_per_wear = total_investment / max(total_wears, 1)
    
    economics = {
        "total_wears": total_wears,
        "total_investment": round(total_investment, 2),
        "average_cost_per_wear": round(average_cost_per_wear, 2),
        "most_valuable_item": most_valuable_item,
        "least_utilized_item": least_utilized_item
    }
    
    # 3. Outfit Success Rate
    # Derived from average outfit scores. Returns 0 if no data exists instead of hallucinating.
    stmt_outfits = select(func.avg(OutfitRecommendation.overall_score)).where(OutfitRecommendation.user_id == user_id)
    result_outfits = await session.execute(stmt_outfits)
    avg_outfit_score = result_outfits.scalar() or 0.0
    
    outfit_success_rate = round(avg_outfit_score, 1) if avg_outfit_score > 0 else 0.0
    
    return {
        "health": health_report,
        "economics": economics,
        "outfit_success_rate": outfit_success_rate
    }


async def get_wear_analytics(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Delegates to WearAnalyticsService."""
    return await wear_analytics_service.analyze(session, user_id)


async def get_purchase_recommendations(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Delegates to PurchaseRecommendationService."""
    recs = await purchase_recommendation_service.recommend(session, user_id)
    return {"recommendations": recs}


async def get_predictive_insights(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Aggregates rotation intelligence, style DNA, and forecasted CPW."""

    # 1. Rotation
    rotation = await rotation_engine.analyze(session, user_id)

    # 2. Style DNA
    style_dna = await style_dna_service.analyze(session, user_id)

    # 3. Forecasted CPW
    stmt_items = select(ClothingItem).where(ClothingItem.user_id == user_id)
    result_items = await session.execute(stmt_items)
    items = result_items.scalars().all()

    total_wears = sum(i.worn_count for i in items)
    total_investment = sum(i.purchase_price or 0.0 for i in items)
    current_cpw = round(total_investment / max(total_wears, 1), 2)

    # Wardrobe age in days (from oldest purchase_date or created_at)
    oldest_date = None
    for item in items:
        item_date = item.purchase_date or item.created_at.date() if item.created_at else None
        if item_date and (oldest_date is None or item_date < oldest_date):
            oldest_date = item_date

    wardrobe_age_days = 0
    if oldest_date:
        wardrobe_age_days = max((datetime.now(timezone.utc).date() - oldest_date).days, 1)

    # Wear velocity: wears per day
    wear_velocity = total_wears / max(wardrobe_age_days, 1)

    # Forecast: project future wears and divide investment
    forecast_30d_wears = total_wears + (wear_velocity * 30)
    forecast_90d_wears = total_wears + (wear_velocity * 90)
    forecast_year_wears = total_wears + (wear_velocity * 365)

    forecast_30d = round(total_investment / max(forecast_30d_wears, 1), 2)
    forecast_90d = round(total_investment / max(forecast_90d_wears, 1), 2)
    forecast_year = round(total_investment / max(forecast_year_wears, 1), 2)

    # Forecast confidence: how reliable is this prediction?
    items_with_price = sum(1 for i in items if i.purchase_price and i.purchase_price > 0)
    items_with_wears = sum(1 for i in items if i.worn_count > 0)
    price_coverage = items_with_price / max(len(items), 1)
    wear_coverage = items_with_wears / max(len(items), 1)
    age_factor = min(wardrobe_age_days / 90, 1.0)  # full confidence after 90 days

    forecast_confidence = int(
        (price_coverage * 35) + (wear_coverage * 35) + (age_factor * 30)
    )
    forecast_confidence = max(0, min(100, forecast_confidence))

    forecasted_cpw = {
        "current_cpw": current_cpw,
        "forecast_30d": forecast_30d,
        "forecast_90d": forecast_90d,
        "forecast_year": forecast_year,
        "forecast_confidence": forecast_confidence,
    }

    return {
        "rotation": rotation,
        "style_dna": style_dna,
        "forecasted_cpw": forecasted_cpw,
    }
