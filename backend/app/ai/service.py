import logging
from app.config import settings
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockProvider
from app.ai.nvidia_provider import NvidiaProvider

logger = logging.getLogger(__name__)


def get_ai_provider() -> BaseAIProvider:
    """
    Factory function to return the configured AI provider instance.

    Supported providers:
      - nvidia  : NVIDIA NIM API (production)
      - mock    : Local mock data (development/testing)
      - gemini  : DEPRECATED — raises an error
    """
    provider_name = settings.AI_PROVIDER.lower().strip()

    if provider_name == "nvidia":
        logger.info("Initializing NVIDIA AI Provider")
        return NvidiaProvider()
    elif provider_name == "mock":
        logger.info("Initializing Mock AI Provider")
        return MockProvider()
    elif provider_name == "gemini":
        logger.warning(
            "AI_PROVIDER=gemini is deprecated and no longer supported. "
            "Please switch to AI_PROVIDER=nvidia or AI_PROVIDER=mock."
        )
        raise ValueError(
            "Gemini provider has been deprecated due to quota limitations. "
            "Use AI_PROVIDER=nvidia or AI_PROVIDER=mock."
        )
    else:
        logger.error(f"Unknown AI_PROVIDER: {provider_name}")
        raise ValueError(
            f"Unknown AI_PROVIDER: {provider_name}. Use 'nvidia' or 'mock'."
        )
