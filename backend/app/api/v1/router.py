"""
Smart Wardrobe AI — API v1 Router

Aggregates all v1 endpoint routers into a single router.
New endpoint modules should be imported and included here.
"""

from fastapi import APIRouter

from app.api.v1.auth import auth_router
from app.api.v1.clothing import clothing_router
from app.api.v1.wardrobe import wardrobe_router
from app.api.v1.recommendations import recommendations_router

api_v1_router = APIRouter()

# Include all v1 sub-routers
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(clothing_router, prefix="/clothing", tags=["Clothing"])
api_v1_router.include_router(wardrobe_router, prefix="/wardrobe", tags=["Wardrobe"])
api_v1_router.include_router(
    recommendations_router, prefix="/recommendations", tags=["Recommendations"]
)
