from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid
from datetime import datetime, timezone

class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # S3 Storage Keys
    front_image_key = Column(String(500), nullable=False)
    back_image_key = Column(String(500), nullable=True)
    label_image_key = Column(String(500), nullable=True)
    thumbnail_key = Column(String(500), nullable=True)
    
    # Basic Details
    type = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    primary_color = Column(String(50), nullable=False)
    secondary_color = Column(String(50), nullable=True)
    size = Column(String(20), nullable=True)
    
    # Style Details
    gender_fit = Column(String(50), nullable=True)
    material = Column(String(50), nullable=True)
    season = Column(String(50), nullable=True)
    occasion = Column(String(50), nullable=True)
    condition = Column(String(50), nullable=True)
    
    # Usage Details
    usage_frequency = Column(String(50), nullable=True)
    wear_count = Column(Integer, default=0, nullable=False)
    last_worn_at = Column(DateTime(timezone=True), nullable=True)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    price_range = Column(String(50), nullable=True)
    notes = Column(String(1000), nullable=True)
    
    # AI Metadata (Pending Phase 3/4)
    ai_detected = Column(Boolean, default=False)
    ai_confidence = Column(Integer, nullable=True) # 0-100
    
    # System
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="clothing_items")
