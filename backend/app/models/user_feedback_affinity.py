import uuid
from sqlalchemy import ForeignKey, String, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin

class UserFeedbackAffinity(Base, UUIDMixin, TimestampMixin):
    """
    Stores cumulative affinity scores for different style dimensions based on user feedback.
    Table: user_feedback_affinities
    """
    __tablename__ = "user_feedback_affinities"
    
    __table_args__ = (
        Index("ix_user_feedback_affinities_user_dim", "user_id", "dimension", "value", unique=True),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # dimension: 'color', 'style', 'category', 'occasion', 'season'
    dimension: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # value: 'Streetwear', 'Earth Tones', 'Formal', etc.
    value: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Cumulative affinity score
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User")
