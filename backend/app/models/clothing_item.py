import uuid

from sqlalchemy import ForeignKey, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin


class ClothingItem(Base, UUIDMixin, TimestampMixin):
    """
    Stores all wardrobe items uploaded by users.
    Table: clothing_items
    """
    __tablename__ = "clothing_items"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
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

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="clothing_items")
