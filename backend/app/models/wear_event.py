import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
import enum

class WearSourceType(str, enum.Enum):
    MANUAL = "MANUAL"
    RECOMMENDATION = "RECOMMENDATION"
    DAILY_STYLIST = "DAILY_STYLIST"
    SAVED_OUTFIT = "SAVED_OUTFIT"

class WearEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "wear_events"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wear_group_id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False, index=True)
    clothing_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="CASCADE"), nullable=False)
    
    worn_at = Column(DateTime(timezone=True), nullable=False, index=True)
    source_type = Column(Enum(WearSourceType), default=WearSourceType.MANUAL, nullable=False)
    
    occasion = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    # Future Compatibility Fields
    season = Column(String, nullable=True)
    weather_snapshot = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User")
    clothing_item = relationship("ClothingItem", back_populates="wear_events")
