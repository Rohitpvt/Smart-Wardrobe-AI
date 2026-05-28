from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base
import uuid
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=False)
    auth_provider = Column(String(20), default="email") # "email" or "google"
    google_id = Column(String(255), unique=True, nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    
    # Profile Setup Fields
    gender_preference = Column(String(50), nullable=True)
    style_preference = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    favorite_colors = Column(JSONB, nullable=True)
    common_occasions = Column(JSONB, nullable=True)
    is_profile_complete = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
