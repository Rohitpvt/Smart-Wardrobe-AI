from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.predictive_stylist.predictive_stylist_service import predictive_stylist_service

router = APIRouter(prefix="/predictive-stylist", tags=["Predictive Stylist"])

@router.get("/insights")
async def get_predictive_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        insights = await predictive_stylist_service.get_insights(db, current_user.id)
        return {"success": True, "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunities")
async def get_predictive_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        opps = await predictive_stylist_service.get_opportunities(db, current_user.id)
        return {"success": True, "data": opps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def get_predictive_forecast(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        forecast = await predictive_stylist_service.get_forecast(db, current_user.id)
        return {"success": True, "data": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
