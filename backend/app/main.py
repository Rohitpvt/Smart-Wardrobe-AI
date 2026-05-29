"""
Smart Wardrobe AI — FastAPI Application Entrypoint

This is the main application file. It creates the FastAPI app instance,
configures middleware, and includes all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.rate_limit import limiter
from app.core.middleware import ContentSizeLimitMiddleware

import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logging.basicConfig(level=logging.INFO, handlers=[handler], force=True)

setup_logging()

from app.config import settings
from app.api.health import health_router
from app.api.v1.auth import auth_router
from app.api.v1.clothing import clothing_router
from app.api.v1.uploads import uploads_router
from app.api.v1.ai import ai_router
from app.api.v1.recommendations import recommendations_router
from app.api.v1.weather import weather_router
from app.api.v1.outfits import outfits_router
from app.api.v1.analytics import analytics_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "AI-powered clothing analyzer and smart wardrobe management API. "
            "Upload clothing images, manage your wardrobe, and receive intelligent "
            "outfit recommendations based on weather, season, occasion, and style."
        ),
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # --- CORS Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Size Limit Middleware (10MB limit) ---
    app.add_middleware(ContentSizeLimitMiddleware, max_upload_size=10 * 1024 * 1024)

    # --- Rate Limiter Setup ---
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # --- Routers ---
    app.include_router(health_router)
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(clothing_router, prefix="/api/v1/clothing", tags=["Clothing"])
    app.include_router(uploads_router, prefix="/api/v1/uploads", tags=["Uploads"])
    app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI"])
    app.include_router(recommendations_router, prefix="/api/v1/recommendations", tags=["Recommendations"])
    app.include_router(weather_router, prefix="/api/v1/weather", tags=["Weather"])
    app.include_router(outfits_router, prefix="/api/v1/outfits", tags=["Outfits"])
    app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])

    return app


# Create the app instance
app = create_app()
