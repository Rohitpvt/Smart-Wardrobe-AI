"""
Smart Wardrobe AI — Backend Application Entry Point.

FastAPI application with CORS, health check, and structured logging.
"""

import logging
import os
from logging.handlers import RotatingFileHandler

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


# --- Logging Setup (TRD §16: Python logging, rotating file handler, JSON) ---

def setup_logging() -> None:
    """Configure application logging per TRD requirements."""
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)

    formatter = logging.Formatter(
        '{"time": "%(asctime)s", "level": "%(levelname)s", '
        '"module": "%(module)s", "message": "%(message)s"}'
    )

    # File handler — rotating, 10 MB, retain 5
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)


setup_logging()
logger = logging.getLogger(__name__)


# --- FastAPI Application ---

from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter, _rate_limit_exceeded_handler

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.FRONTEND_URLS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app import models
from app.api.endpoints import auth, users, wardrobe, uploads, dashboard, recommendations, chat, intelligence

# --- Routers ---
app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Auth"])
app.include_router(users.router, prefix=f"{settings.API_PREFIX}/users", tags=["Users"])
app.include_router(wardrobe.router, prefix=f"{settings.API_PREFIX}/wardrobe", tags=["Wardrobe"])
app.include_router(uploads.router, prefix=f"{settings.API_PREFIX}/uploads", tags=["Uploads"])
app.include_router(dashboard.router, prefix=f"{settings.API_PREFIX}/dashboard", tags=["Dashboard"])
app.include_router(recommendations.router, prefix=f"{settings.API_PREFIX}")
app.include_router(chat.router, prefix=f"{settings.API_PREFIX}")
app.include_router(intelligence.router, prefix=f"{settings.API_PREFIX}/intelligence", tags=["Intelligence"])

# --- Health Check ---

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify the backend is running."""
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "project": settings.PROJECT_NAME,
            "version": "1.0.0",
        },
    }


logger.info("Smart Wardrobe AI backend initialized successfully.")
