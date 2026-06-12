"""
Centralized import for all models.
This ensures Alembic and the application can discover all models 
by simply importing `app.models`.
"""

from app.models.base import Base
from app.models.user import User
from app.models.clothing_item import ClothingItem
from app.models.outfit_recommendation import OutfitRecommendation
from app.models.chat import ChatConversation, ChatMessage
from app.models.refresh_token import RefreshToken

# Expose Base and all models
__all__ = [
    "Base",
    "User",
    "ClothingItem",
    "OutfitRecommendation",
    "ChatConversation",
    "ChatMessage",
    "RefreshToken",
]
