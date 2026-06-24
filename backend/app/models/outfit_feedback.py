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
        Index("ix_outfit_feedback_rec_created", "recommendation_id", text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # DEPRECATED: Old reference to outfit
    outfit_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("outfit_recommendations.id", ondelete="CASCADE"), index=True, nullable=True
    )
    
    # NEW: Phase 9.11A
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("outfit_recommendations.id", ondelete="CASCADE"), index=True, nullable=True
    )
    
    # NEW: Phase 9.11A Rating (LOVE, LIKE, NEUTRAL, DISLIKE)
    rating: Mapped[str | None] = mapped_column(String(50), nullable=True)
    feedback_weight: Mapped[int | None] = mapped_column(nullable=True, server_default="0")
    
    # DEPRECATED: Old fields
    # feedback_type: 'like', 'love', 'dislike', 'wore_it', 'save_for_later', 'removed_from_saved'
    feedback_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # feedback_source: 'manual', 'system_generated'
    feedback_source: Mapped[str | None] = mapped_column(String(50), nullable=True, server_default="manual")

    # Relationships
    user: Mapped["User"] = relationship("User")
    outfit: Mapped["OutfitRecommendation"] = relationship("OutfitRecommendation", foreign_keys=[outfit_id])
    recommendation: Mapped["OutfitRecommendation"] = relationship("OutfitRecommendation", foreign_keys=[recommendation_id])
