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
    
    # User AI Provider Encryption
    USER_AI_KEY_ENCRYPTION_SECRET: str | None = None
    PLATFORM_AI_FALLBACK_ENABLED: bool = False
    
    # --- JWT Authentication ---
    SECRET_KEY: str = Field(
        ...,
        description="Secret key for JWT signing",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str | None = Field(
        default=None,
        description="Google OAuth Client ID"
    )
    DEBUG_GOOGLE_OAUTH: bool = False

    # --- Clerk Auth ---
    CLERK_SECRET_KEY: str = Field(default="", description="Clerk secret key (backend only)")
    CLERK_WEBHOOK_SECRET: str = Field(default="", description="Clerk webhook signing secret")
    CLERK_JWKS_URL: str = Field(default="", description="Clerk JWKS endpoint URL")
    CLERK_ISSUER: str = Field(default="", description="Clerk issuer URL")
    CLERK_AUDIENCE: str = Field(default="", description="Clerk audience (optional)")

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


    PLATFORM_AI_FALLBACK_ENABLED: bool = Field(
        default=True,
        description="Whether fallback provider can be used if primary fails"
    )
    PLATFORM_AI_QUOTA_ENABLED: bool = Field(
        default=True,
        description="Whether to enforce the daily limit"
    )

    # --- AI Quota Plans ---
    # PLATFORM_AI_FREE_DAILY_LIMIT is kept for backward compatibility for the free tier
    PLATFORM_AI_FREE_DAILY_LIMIT: int = Field(
        default=10,
        description="Legacy free daily AI limit"
    )
    AI_QUOTA_FREE_DAILY_LIMIT: int | None = Field(
        default=None,
        description="Daily limit for free users"
    )
    AI_QUOTA_PREMIUM_DAILY_LIMIT: int | None = Field(
        default=None,
        description="Daily limit for premium users"
    )
    AI_QUOTA_PRO_DAILY_LIMIT: int | None = Field(
        default=None,
        description="Daily limit for pro users"
    )

    # --- AI Cost Estimation ---
    AI_COST_GEMINI_INPUT_PER_1M_TOKENS: float | None = Field(
        default=None,
        description="Cost in currency per 1M input tokens for Gemini"
    )
    AI_COST_GEMINI_OUTPUT_PER_1M_TOKENS: float | None = Field(
        default=None,
        description="Cost in currency per 1M output tokens for Gemini"
    )
    AI_COST_NVIDIA_INPUT_PER_1M_TOKENS: float | None = Field(
        default=None,
        description="Cost in currency per 1M input tokens for NVIDIA"
    )
    AI_COST_NVIDIA_OUTPUT_PER_1M_TOKENS: float | None = Field(
        default=None,
        description="Cost in currency per 1M output tokens for NVIDIA"
    )

    # --- OpenWeather ---
    OPENWEATHER_API_KEY: str = Field(
        default="",
        description="OpenWeather API key",
    )

    # --- Rate Limiting & Caching ---
    RATE_LIMIT_DAILY_STYLIST: str = "10/day"
    RATE_LIMIT_RECOMMENDATIONS: str = "100/day"
    RATE_LIMIT_SHOPPING: str = "50/day"
    REDIS_URL: str = Field(
        default="",
        description="Redis URL for caching",
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
