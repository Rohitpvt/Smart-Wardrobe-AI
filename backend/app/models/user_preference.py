from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base, TimestampMixin, UUIDMixin

class UserPreference(Base, UUIDMixin, TimestampMixin):
    """
    Stores long-term user personalization settings.
    Table: user_preferences
    """
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    
    # Allowed values: masculine, feminine, neutral
    styling_preference: Mapped[str] = mapped_column(String(20), nullable=False, default="neutral")

    # Relationship to user
    user = relationship("User", backref="preferences")
