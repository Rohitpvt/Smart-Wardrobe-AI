from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid

class IntelligenceFeedItemSchema(BaseModel):
    id: uuid.UUID
    item_type: str
    content: str
    impact_score: float
    confidence_score: float = 80.0
    feed_category: str = "operational"
    action_payload: Optional[Dict[str, Any]] = None
    source_services: Optional[List[str]] = None
    is_read: int
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WardrobeOpportunitySchema(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    impact_score: float
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WardrobeGoalSchema(BaseModel):
    id: uuid.UUID
    title: str
    goal_type: str
    metric_target: float
    current_progress: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WeeklyReportSchema(BaseModel):
    id: uuid.UUID
    report_date: datetime
    snapshot_json: Dict[str, Any]
    coaching_advice: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ReadinessScoreSchema(BaseModel):
    score: int
    strengths: List[str]
    gaps: List[str]
    recommendations: List[str]

class IntelligenceDashboardResponse(BaseModel):
    feed: List[IntelligenceFeedItemSchema]
    opportunities: List[WardrobeOpportunitySchema]
    goals: List[WardrobeGoalSchema]
    weekly_report: Optional[WeeklyReportSchema] = None
    readiness_scores: Optional[Dict[str, ReadinessScoreSchema]] = None

class GoalCreate(BaseModel):
    title: str
    goal_type: str
    metric_target: float

class GoalUpdate(BaseModel):
    current_progress: Optional[float] = None
    status: Optional[str] = None

class OpportunityUpdate(BaseModel):
    status: str
