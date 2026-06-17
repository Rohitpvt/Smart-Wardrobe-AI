from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.daily_stylist.daily_stylist_service import daily_stylist_service
from app.services.recommendations.engine import RecommendationError
from app.core.rate_limit import limiter
from app.core.config import settings

router = APIRouter()

@router.get("/daily-stylist/brief")
@limiter.limit(settings.RATE_LIMIT_DAILY_STYLIST)
async def get_daily_style_brief(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        brief = await daily_stylist_service.get_or_create_daily_brief(db, current_user)
        return {"success": True, "brief": brief}
    except RecommendationError as e:
        # Handle empty states or generation failures
        return {
            "success": False, 
            "error_code": e.error_code, 
            "message": str(e)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
