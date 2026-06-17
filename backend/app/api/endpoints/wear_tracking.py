from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wear_event import WearSourceType
from app.schemas.analytics import AnalyticsWindow

from app.services.wear_tracking.wear_tracking_service import wear_tracking_service
from app.services.wear_tracking.outfit_history_service import outfit_history_service
from app.services.wear_tracking.wear_analytics_engine import wear_analytics_engine
from app.services.wear_tracking.repetition_detector import repetition_detector
from app.services.wear_tracking.cost_per_wear_engine import cost_per_wear_engine

router = APIRouter(prefix="/wear-tracking", tags=["Wear Tracking"])

class LogWearEventRequest(BaseModel):
    clothing_item_ids: List[str]
    worn_at: datetime
    source_type: WearSourceType = WearSourceType.MANUAL
    occasion: Optional[str] = None
    notes: Optional[str] = None
    season: Optional[str] = None

@router.post("/log")
async def log_wear_event(
    req: LogWearEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        item_ids = [uuid.UUID(uid) for uid in req.clothing_item_ids]
        group_id = await wear_tracking_service.log_wear_event(
            session=db,
            user_id=current_user.id,
            clothing_item_ids=item_ids,
            worn_at=req.worn_at,
            source_type=req.source_type,
            occasion=req.occasion,
            notes=req.notes,
            season=req.season
        )
        return {"success": True, "wear_group_id": str(group_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_outfit_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    window: AnalyticsWindow = Query(AnalyticsWindow.DAYS_30),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    history = await outfit_history_service.get_history(db, current_user.id, page, limit, window)
    return {"success": True, "data": history}

@router.get("/analytics")
async def get_analytics(
    window: AnalyticsWindow = Query(AnalyticsWindow.DAYS_30),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    analytics = await wear_analytics_engine.get_analytics(db, current_user.id, window)
    return {"success": True, "data": analytics}

@router.get("/repetition")
async def get_repetition(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    warnings = await repetition_detector.get_repetition_insights(db, current_user.id)
    cpw = await cost_per_wear_engine.get_cpw_metrics(db, current_user.id)
    
    return {
        "success": True, 
        "data": {
            "repetition_warnings": warnings,
            "cost_per_wear": cpw
        }
    }
