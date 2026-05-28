"""
Smart Wardrobe AI — Health Check Response Schema
"""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Response model for the health check endpoint."""

    status: str
    version: str
    service: str
