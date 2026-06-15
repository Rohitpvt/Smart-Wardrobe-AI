import uuid

from sqlalchemy import ForeignKey, String, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin


class OutfitFeedback(Base, UUIDMixin, TimestampMixin):
    """
    Stores user feedback on generated outfit combinations.
    Table: outfit_feedback
    """
    __tablename__ = "outfit_feedback"
    
    __table_args__ = (
        Index("ix_outfit_feedback_user_created", "user_id", text("created_at DESC")),
        Index("ix_outfit_feedback_outfit_created", "outfit_id", text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    outfit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("outfit_recommendations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # feedback_type: 'like', 'love', 'dislike', 'wore_it', 'save_for_later', 'removed_from_saved'
    feedback_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # feedback_source: 'manual', 'system_generated'
    feedback_source: Mapped[str] = mapped_column(String(50), nullable=False, server_default="manual")

    # Relationships
    user: Mapped["User"] = relationship("User")
    outfit: Mapped["OutfitRecommendation"] = relationship("OutfitRecommendation")
