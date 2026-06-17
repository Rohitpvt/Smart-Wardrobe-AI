import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.wear_event import WearEvent

from sqlalchemy import ForeignKey, String, Text, Index, text, Float, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin


class ClothingItem(Base, UUIDMixin, TimestampMixin):
    """
    Stores all wardrobe items uploaded by users.
    Table: clothing_items
    """
    __tablename__ = "clothing_items"

    __table_args__ = (
        Index("ix_clothing_items_user_created", "user_id", text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    clothing_type: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    color: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    pattern: Mapped[str | None] = mapped_column(String(100), nullable=True)
    material: Mapped[str | None] = mapped_column(String(100), nullable=True)
    season: Mapped[str | None] = mapped_column(String(50), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[int | None] = mapped_column(nullable=True)
    ai_generated: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    purchase_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    purchase_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    worn_count: Mapped[int] = mapped_column(default=0, nullable=False)
    last_worn_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="clothing_items")
    wear_events: Mapped[list["WearEvent"]] = relationship("WearEvent", back_populates="clothing_item", cascade="all, delete-orphan")
