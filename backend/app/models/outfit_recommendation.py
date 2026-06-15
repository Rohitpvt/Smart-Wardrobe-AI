import uuid

from sqlalchemy import ForeignKey, String, Text, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, TimestampMixin, UUIDMixin


class OutfitRecommendation(Base, UUIDMixin, TimestampMixin):
    """
    Stores generated outfit combinations.
    Table: outfit_recommendations
    """
    __tablename__ = "outfit_recommendations"
    
    __table_args__ = (
        Index("ix_outfit_recommendations_user_created", "user_id", text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    top_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True
    )
    bottom_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True
    )
    footwear_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True
    )
    
    occasion: Mapped[str] = mapped_column(String(50), nullable=False)

    ai_explanation: Mapped[str] = mapped_column(
        Text, 
        nullable=False, 
        server_default="This combination was selected based on your wardrobe preferences and color profile."
    )
    
    weather_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Scoring fields
    overall_score: Mapped[int | None] = mapped_column(nullable=True)
    color_score: Mapped[int | None] = mapped_column(nullable=True)
    weather_score: Mapped[int | None] = mapped_column(nullable=True)
    occasion_score: Mapped[int | None] = mapped_column(nullable=True)
    season_score: Mapped[int | None] = mapped_column(nullable=True)
    utilization_score: Mapped[int | None] = mapped_column(nullable=True)
    score_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="outfit_recommendations")
    top_item: Mapped["ClothingItem"] = relationship("ClothingItem", foreign_keys=[top_item_id])
    bottom_item: Mapped["ClothingItem"] = relationship("ClothingItem", foreign_keys=[bottom_item_id])
    footwear_item: Mapped["ClothingItem"] = relationship("ClothingItem", foreign_keys=[footwear_item_id])
