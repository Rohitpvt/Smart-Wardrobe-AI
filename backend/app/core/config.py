"""
Application configuration.

Loads environment variables using pydantic-settings.
All sensitive values come from .env — never hardcoded.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Project ---
    PROJECT_NAME: str = "Smart Wardrobe AI"
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # --- Database ---
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection string",
    )

    # --- JWT Authentication ---
    SECRET_KEY: str = Field(
        ...,
        description="Secret key for JWT signing",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Gemini AI ---
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API key",
    )

    # --- NVIDIA NIM AI ---
    NVIDIA_API_KEY: str = Field(
        default="",
        description="NVIDIA NIM API key",
    )

    # --- AI Provider Routing ---
    AI_PRIMARY_PROVIDER: str = Field(
        default="gemini",
        description="Primary AI provider: gemini | nvidia",
    )
    AI_FALLBACK_PROVIDER: str = Field(
        default="nvidia",
        description="Fallback AI provider: nvidia | gemini",
    )

    # --- OpenWeather ---
    OPENWEATHER_API_KEY: str = Field(
        default="",
        description="OpenWeather API key",
    )

    # --- Frontend ---
    FRONTEND_URLS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- File Uploads ---
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
