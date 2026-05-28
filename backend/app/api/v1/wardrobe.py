"""
Smart Wardrobe AI — Wardrobe Endpoints (Placeholder)

Endpoints planned for Phase 2/3:
- GET /stats — Wardrobe statistics
- GET /search — Search/filter clothing items
"""

from fastapi import APIRouter

wardrobe_router = APIRouter()


@wardrobe_router.get("/status")
async def wardrobe_status():
    """Placeholder: Wardrobe module status."""
    return {
        "module": "wardrobe",
        "status": "placeholder",
        "message": "Wardrobe management endpoints will be implemented in Phase 2.",
    }
