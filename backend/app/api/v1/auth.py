"""
Smart Wardrobe AI — Authentication Endpoints (Placeholder)

Endpoints planned for Phase 2:
- POST /register — Email registration
- POST /login — Email login
- POST /google — Google OAuth callback
- POST /refresh — Refresh access token
- POST /logout — Invalidate tokens
- GET /me — Get current user
"""

from fastapi import APIRouter

auth_router = APIRouter()


@auth_router.get("/status")
async def auth_status():
    """Placeholder: Authentication module status."""
    return {
        "module": "auth",
        "status": "placeholder",
        "message": "Authentication endpoints will be implemented in Phase 2.",
    }
