"""
Smart Wardrobe AI — Recommendation Endpoints (Placeholder)

Endpoints planned for Phase 3:
- POST /generate — Generate outfit recommendation
- GET /history — Past recommendations
- POST /{id}/feedback — Rate a recommendation
"""

from fastapi import APIRouter

recommendations_router = APIRouter()


@recommendations_router.get("/status")
async def recommendations_status():
    """Placeholder: Recommendations module status."""
    return {
        "module": "recommendations",
        "status": "placeholder",
        "message": "AI recommendation endpoints will be implemented in Phase 3.",
    }
