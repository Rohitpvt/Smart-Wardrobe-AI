"""
Smart Wardrobe AI — Clothing Item Model (Placeholder)

This model will be implemented in Phase 2 when the database is connected.
See PROJECT_MEMORY.md section 6 for the planned schema.
"""

# Phase 2: Uncomment and implement
# from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, ARRAY
# from sqlalchemy.dialects.postgresql import UUID, JSONB
# from sqlalchemy.orm import relationship
# from app.db.base import Base
# import uuid
# from datetime import datetime
#
# class ClothingItem(Base):
#     __tablename__ = "clothing_items"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
#     s3_key = Column(String(500), nullable=False)
#     name = Column(String(100))
#     category = Column(String(50))       # top, bottom, shoes, accessory
#     sub_category = Column(String(50))   # t-shirt, jeans, sneakers
#     color_primary = Column(String(30))
#     color_secondary = Column(String(30))
#     pattern = Column(String(30))        # solid, striped, plaid
#     material = Column(String(30))
#     season = Column(ARRAY(String(20)))  # [spring, summer, fall, winter]
#     occasion = Column(ARRAY(String(30))) # [casual, formal, sport]
#     brand = Column(String(50))
#     times_worn = Column(Integer, default=0)
#     last_worn_at = Column(DateTime, nullable=True)
#     ai_tags = Column(JSONB, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
#
#     user = relationship("User", back_populates="clothing_items")
