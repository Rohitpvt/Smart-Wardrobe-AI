import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin


class OutfitRecommendation(Base, UUIDMixin, TimestampMixin):
    """
    Stores generated outfit combinations.
    Table: outfit_recommendations
    """
    __tablename__ = "outfit_recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # We use SET NULL per the previous architectural review, but DATABASE_SCHEMA just says "Foreign Keys -> clothing_items.id".
    # I will add ondelete="SET NULL" since it's the standard way to handle deleted items in an outfit.
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

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="outfit_recommendations")
