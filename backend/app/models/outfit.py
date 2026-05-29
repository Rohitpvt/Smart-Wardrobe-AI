from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid
from datetime import datetime, timezone

class SavedOutfit(Base):
    __tablename__ = "saved_outfits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    # Clothing item relations
    top_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    bottom_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    footwear_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    accessory_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    
    # Context
    occasion = Column(String(50), nullable=True)
    season = Column(String(50), nullable=True)
    notes = Column(String(1000), nullable=True)
    
    # System
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships (Optional but useful for ORM joins if needed, leaving implicit mostly)
    user = relationship("User")


class OutfitHistory(Base):
    __tablename__ = "outfit_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Clothing item relations
    top_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    bottom_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    footwear_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    accessory_item_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    
    # Context
    occasion = Column(String(50), nullable=True)
    weather = Column(String(50), nullable=True)
    worn_date = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    rating = Column(Integer, nullable=True) # e.g. 1-5
    notes = Column(String(1000), nullable=True)
    
    # System
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User")
