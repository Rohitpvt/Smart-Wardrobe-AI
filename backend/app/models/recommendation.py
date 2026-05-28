"""
Smart Wardrobe AI — Recommendation Model (Placeholder)

This model will be implemented in Phase 3 when recommendations are built.
See PROJECT_MEMORY.md section 6 for the planned schema.
"""

# Phase 3: Uncomment and implement
# from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, ARRAY
# from sqlalchemy.dialects.postgresql import UUID, JSONB
# from app.db.base import Base
# import uuid
# from datetime import datetime
#
# class Recommendation(Base):
#     __tablename__ = "recommendations"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
#     clothing_item_ids = Column(ARRAY(UUID(as_uuid=True)))
#     occasion = Column(String(30))
#     weather_context = Column(JSONB)
#     ai_reasoning = Column(Text)
#     accepted = Column(Boolean, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
