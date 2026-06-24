import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


class AIUsageEvent(Base):
    """
    Detailed tracking of every AI execution to support quotas, 
    auditing, cost control, and future paid plans.
    """
    __tablename__ = "ai_usage_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    provider = Column(String, nullable=False, index=True) # e.g. "gemini", "nvidia"
    credential_source = Column(String, nullable=False) # e.g. "platform_gemini", "platform_nvidia"
    feature_name = Column(String, nullable=False, index=True) # e.g. "stylist_chat"
    model_name = Column(String, nullable=False) # e.g. "gemini-2.5-flash"
    
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    
    estimated_cost = Column(Float, nullable=True)
    
    status = Column(String, nullable=False, index=True) # "started", "success", "failed", "quota_blocked", "fallback_success", "fallback_failed"
    error_code = Column(String, nullable=True)
    latency_ms = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    __table_args__ = (
        Index('ix_ai_usage_events_user_created', 'user_id', 'created_at'),
    )
