"""
Smart Wardrobe AI — FastAPI Application Entrypoint

This is the main application file. It creates the FastAPI app instance,
configures middleware, and includes all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.health import health_router
from app.api.v1.auth import auth_router
from app.api.v1.clothing import clothing_router
from app.api.v1.uploads import uploads_router


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

    # --- Routers ---
    app.include_router(health_router)
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(clothing_router, prefix="/api/v1/clothing", tags=["Clothing"])
    app.include_router(uploads_router, prefix="/api/v1/uploads", tags=["Uploads"])

    return app


# Create the app instance
app = create_app()
