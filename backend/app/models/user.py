from typing import List

from sqlalchemy import String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy import DateTime

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    """
    Stores user account information.
    Table: users
    """
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), default="local", nullable=False)
    clerk_user_id: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true", nullable=False)
    email_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(default=False, nullable=False)
    ai_plan: Mapped[str] = mapped_column(String(50), default="free", server_default="free", nullable=False)
    is_admin: Mapped[bool] = mapped_column(default=False, server_default="false", nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country_code: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # Auth Redirect / Login Tracking
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    first_login_redirect_pending: Mapped[bool] = mapped_column(default=False, server_default='false', nullable=False)

    # Extended Profile Fields (Phase 9.10A)
    age: Mapped[int | None] = mapped_column(nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    height_cm: Mapped[int | None] = mapped_column(nullable=True)
    body_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fashion_experience: Mapped[str | None] = mapped_column(String(50), nullable=True)
    primary_style: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Weather Targeting (Phase 9.13.X)
    weather_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    weather_country: Mapped[str | None] = mapped_column(String(10), nullable=True)
    weather_latitude: Mapped[float | None] = mapped_column(nullable=True)
    weather_longitude: Mapped[float | None] = mapped_column(nullable=True)
    weather_location_enabled: Mapped[bool] = mapped_column(default=True, server_default="true", nullable=False)
    profile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    climate_region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    favorite_colors: Mapped[str | None] = mapped_column(String(255), nullable=True)
    disliked_colors: Mapped[str | None] = mapped_column(String(255), nullable=True)
    preferred_fit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    budget_preference: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    clothing_items: Mapped[List["ClothingItem"]] = relationship(
        "ClothingItem", back_populates="user", cascade="all, delete-orphan"
    )
    outfit_recommendations: Mapped[List["OutfitRecommendation"]] = relationship(
        "OutfitRecommendation", back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    chat_conversations: Mapped[List["ChatConversation"]] = relationship(
        "ChatConversation", back_populates="user", cascade="all, delete-orphan"
    )
    intelligence_feed_items = relationship(
        "IntelligenceFeedItem", back_populates="user", cascade="all, delete-orphan"
    )
    wardrobe_opportunities = relationship(
        "WardrobeOpportunity", back_populates="user", cascade="all, delete-orphan"
    )
    wardrobe_goals = relationship(
        "WardrobeGoal", back_populates="user", cascade="all, delete-orphan"
    )
    weekly_reports = relationship(
        "WeeklyReport", back_populates="user", cascade="all, delete-orphan"
    )
    insight_quality_metrics = relationship(
        "InsightQualityMetric", back_populates="user", cascade="all, delete-orphan"
    )
