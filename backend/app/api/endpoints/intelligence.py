import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.intelligence import WardrobeOpportunity, WardrobeGoal
from app.schemas.intelligence import (
    IntelligenceDashboardResponse, 
    GoalCreate, 
    GoalUpdate, 
    OpportunityUpdate,
    WardrobeGoalSchema
)

from app.services.intelligence_feed_service import intelligence_feed_service
from app.services.opportunity_engine import opportunity_engine
from app.services.weekly_report_service import weekly_report_service
from app.services.context.readiness_service import readiness_service
from app.models.clothing_item import ClothingItem

router = APIRouter()

@router.get("/dashboard", response_model=IntelligenceDashboardResponse)
async def get_intelligence_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Unified endpoint for the Wardrobe Intelligence Center.
    Handles lazy evaluation of feeds and reports.
    """
    # 1. Lazy evaluation of feeds and opportunities
    # opportunity_engine clears expired and generates new
    await opportunity_engine.generate_opportunities(db, current_user.id)
    
    # feed_service returns feed items, generating if necessary
    feed_items = await intelligence_feed_service.get_or_generate_feed(db, current_user.id)
    
    # 2. Get Weekly Report
    weekly_report = await weekly_report_service.get_or_generate_report(db, current_user.id)
    
    # 3. Get Active Opportunities
    stmt_opps = select(WardrobeOpportunity).where(
        WardrobeOpportunity.user_id == current_user.id,
        WardrobeOpportunity.status == "active"
    ).order_by(WardrobeOpportunity.impact_score.desc())
    opportunities = list((await db.execute(stmt_opps)).scalars().all())
    
    # 4. Get Active Goals
    stmt_goals = select(WardrobeGoal).where(
        WardrobeGoal.user_id == current_user.id,
        WardrobeGoal.status == "active"
    )
    goals = list((await db.execute(stmt_goals)).scalars().all())

    # 5. Get Readiness Scores
    stmt_items = select(ClothingItem).where(ClothingItem.user_id == current_user.id)
    items = list((await db.execute(stmt_items)).scalars().all())
    item_dicts = [{"category": item.category} for item in items]
    readiness_scores = readiness_service.calculate_readiness_scores(item_dicts)

    return {
        "feed": feed_items,
        "opportunities": opportunities,
        "goals": goals,
        "weekly_report": weekly_report,
        "readiness_scores": readiness_scores
    }

@router.post("/goals", response_model=WardrobeGoalSchema)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    goal = WardrobeGoal(
        user_id=current_user.id,
        title=goal_in.title,
        goal_type=goal_in.goal_type,
        metric_target=goal_in.metric_target
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal

@router.patch("/goals/{goal_id}", response_model=WardrobeGoalSchema)
async def update_goal(
    goal_id: uuid.UUID,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    stmt = select(WardrobeGoal).where(WardrobeGoal.id == goal_id, WardrobeGoal.user_id == current_user.id)
    goal = (await db.execute(stmt)).scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if goal_in.current_progress is not None:
        goal.current_progress = goal_in.current_progress
    if goal_in.status is not None:
        goal.status = goal_in.status
        
    await db.commit()
    await db.refresh(goal)
    return goal

@router.patch("/opportunities/{opp_id}/status")
async def update_opportunity_status(
    opp_id: uuid.UUID,
    status_update: OpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    stmt = select(WardrobeOpportunity).where(WardrobeOpportunity.id == opp_id, WardrobeOpportunity.user_id == current_user.id)
    opp = (await db.execute(stmt)).scalars().first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    opp.status = status_update.status
    await db.commit()
    return {"success": True, "status": opp.status}
