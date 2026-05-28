"""
Smart Wardrobe AI — Health Check Endpoint

Provides a simple health check route for monitoring and load balancers.
"""

from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.config import settings

health_router = APIRouter(tags=["Health"])


@health_router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the current health status of the Smart Wardrobe AI API.",
)
async def health_check() -> HealthResponse:
    """Check if the API service is running and healthy."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        service=settings.APP_NAME,
    )
