import uuid
from datetime import date
from sqlalchemy import ForeignKey, String, Date, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, TimestampMixin, UUIDMixin

class DailyStyleBrief(Base, UUIDMixin, TimestampMixin):
    """
    Stores the daily style brief cache to ensure deterministic generation per day,
    and tracks streaks.
    """
    __tablename__ = "daily_style_briefs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # Store the specific date this brief applies to (e.g. 2026-06-17)
    brief_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    
    # Cached outputs
    recommended_outfit: Mapped[dict] = mapped_column(JSONB, nullable=False)
    weather_context: Mapped[dict] = mapped_column(JSONB, nullable=False)
    insight: Mapped[str] = mapped_column(String, nullable=False)
    style_tip: Mapped[str] = mapped_column(String, nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Streak tracking
    consecutive_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    
    user: Mapped["User"] = relationship("User")
