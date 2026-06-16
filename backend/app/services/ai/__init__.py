"""
AI Service Package

Exports the provider-agnostic ai_provider router as the primary entry point.
Individual providers (gemini_provider, nvidia_provider) are available for
direct access if needed, but all application code should use ai_provider.
"""
from .schemas import AIClothingExtraction
from .provider import AIProvider
from .gemini_provider import gemini_provider
from .nvidia_provider import nvidia_provider
from .ai_provider_router import ai_provider

__all__ = [
    "AIClothingExtraction",
    "AIProvider",
    "ai_provider",
    "gemini_provider",
    "nvidia_provider",
]
