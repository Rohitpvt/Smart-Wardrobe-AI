"""
Smart Wardrobe AI — User Model (Placeholder)

This model will be implemented in Phase 2 when the database is connected.
See PROJECT_MEMORY.md section 6 for the planned schema.
"""

# Phase 2: Uncomment and implement
# from sqlalchemy import Column, String, Boolean, DateTime
# from sqlalchemy.dialects.postgresql import UUID
# from app.db.base import Base
# import uuid
# from datetime import datetime
#
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     email = Column(String(255), unique=True, nullable=False, index=True)
#     hashed_password = Column(String(255), nullable=True)
#     full_name = Column(String(100))
#     gender = Column(String(20))
#     style_preference = Column(String(50))
#     google_id = Column(String(255), unique=True, nullable=True)
#     avatar_url = Column(String(500))
#     is_active = Column(Boolean, default=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
