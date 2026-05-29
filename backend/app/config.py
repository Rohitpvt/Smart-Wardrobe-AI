"""
Smart Wardrobe AI — Application Configuration

Uses Pydantic Settings to load configuration from environment variables.
All secrets and config values are read from .env file or system environment.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "Smart Wardrobe AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # --- Database (Phase 2+) ---
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/smart_wardrobe"

    # --- JWT Authentication (Phase 2+) ---
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- AWS S3 (Phase 2+) ---
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "smart-wardrobe-uploads"
    AWS_S3_PRESIGNED_EXPIRE_SECONDS: int = 900

    # --- AI Provider ---
    AI_PROVIDER: str = "mock"  # Options: mock, gemini, nvidia
    GEMINI_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"

    # --- Weather Provider ---
    WEATHER_PROVIDER: str = "mock"  # Options: mock, openweather
    OPENWEATHER_API_KEY: str = ""

    # --- Google OAuth (Phase 2+) ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Singleton settings instance
settings = Settings()
