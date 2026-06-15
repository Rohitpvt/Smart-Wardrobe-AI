import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base


class IntelligenceFeedItem(Base):
    __tablename__ = "intelligence_feed_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    item_type = Column(String(50), nullable=False)  # "insight", "alert", "opportunity", "coaching"
    content = Column(Text, nullable=False)
    impact_score = Column(Float, default=0.0)
    
    action_payload = Column(JSONB, nullable=True)
    source_services = Column(JSONB, nullable=True)  # List of service strings
    
    is_read = Column(Integer, default=0) # 0 = unread, 1 = read
    
    confidence_score = Column(Float, default=80.0)
    feed_category = Column(String(50), default="operational") # operational, seasonal, behavioral, weather, opportunity
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="intelligence_feed_items")

class InsightQualityMetric(Base):
    """
    Internal tracking for insight generation and action rates.
    """
    __tablename__ = "insight_quality_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    insight_type = Column(String(100), nullable=False) # e.g., 'weather_alert', 'rotation_opportunity'
    action_taken = Column(String(50), nullable=True) # e.g., 'dismissed', 'completed', 'clicked'
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="insight_quality_metrics")


class WardrobeOpportunity(Base):
    __tablename__ = "wardrobe_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    impact_score = Column(Float, default=0.0)
    
    status = Column(String(50), default="active")  # "active", "completed", "dismissed", "expired"
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="wardrobe_opportunities")


class WardrobeGoal(Base):
    __tablename__ = "wardrobe_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    goal_type = Column(String(50), nullable=False)  # "rotation", "cpw", "diversity", "category_growth", "utilization"
    
    metric_target = Column(Float, nullable=False)
    current_progress = Column(Float, default=0.0)
    
    status = Column(String(50), default="active")  # "active", "completed"
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="wardrobe_goals")


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    report_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    snapshot_json = Column(JSONB, nullable=False)  # Stores cpw, rotation_score, etc.
    coaching_advice = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="weekly_reports")
