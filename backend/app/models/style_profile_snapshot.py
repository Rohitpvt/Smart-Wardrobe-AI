import uuid

from sqlalchemy import ForeignKey, String, Integer, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, TimestampMixin, UUIDMixin


class StyleProfileSnapshot(Base, UUIDMixin, TimestampMixin):
    """
    Stores historical weekly snapshots of a user's style evolution.
    Table: style_profile_snapshots
    """
    __tablename__ = "style_profile_snapshots"
    
    __table_args__ = (
        Index("ix_style_snapshots_user_created", "user_id", text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    profile_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    top_colors: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    top_categories: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    
    personalization_score: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

    # Relationships
    user: Mapped["User"] = relationship("User")
