"""
Smart Wardrobe AI — Clothing Endpoints (Placeholder)

Endpoints planned for Phase 2:
- GET / — List user's clothing items
- POST / — Create clothing item
- GET /{id} — Get single item
- PUT /{id} — Update item
- DELETE /{id} — Delete item
- POST /upload-url — Get S3 presigned upload URL
- POST /{id}/analyze — AI-analyze clothing image
"""

from fastapi import APIRouter

clothing_router = APIRouter()


@clothing_router.get("/status")
async def clothing_status():
    """Placeholder: Clothing module status."""
    return {
        "module": "clothing",
        "status": "placeholder",
        "message": "Clothing CRUD endpoints will be implemented in Phase 2.",
    }
