from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from pydantic import BaseModel
import uuid

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.style_memory.style_memory_service import style_memory_service

router = APIRouter()

class FeedbackRequest(BaseModel):
    outfit_id: str
    feedback_type: str

@router.post("/feedback/outfit", status_code=201)
async def submit_outfit_feedback(
    body: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        outfit_uuid = uuid.UUID(body.outfit_id)
        await style_memory_service.record_feedback(db, current_user.id, outfit_uuid, body.feedback_type)
        return {"success": True, "message": "Feedback recorded successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/style-memory/profile")
async def get_style_memory_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await style_memory_service.get_style_memory_profile(db, current_user.id)
    return {"success": True, "data": profile}

@router.get("/style-memory/insights")
async def get_style_memory_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await style_memory_service.get_style_memory_profile(db, current_user.id)
    return {"success": True, "data": {"insights": profile.get("recently_learned_insights", [])}}
