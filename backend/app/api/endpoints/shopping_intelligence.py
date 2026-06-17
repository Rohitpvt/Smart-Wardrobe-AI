from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.config import settings
from app.core.rate_limit import limiter
from app.models.user import User
from app.services.shopping_intelligence.shopping_intelligence_service import shopping_intelligence_service

router = APIRouter(prefix="/shopping-intelligence", tags=["Shopping Intelligence"])

@router.get("/opportunities")
@limiter.limit(settings.RATE_LIMIT_SHOPPING)
async def get_shopping_opportunities(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        opportunities = await shopping_intelligence_service.get_opportunities(db, current_user.id)
        return {"success": True, "data": opportunities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
