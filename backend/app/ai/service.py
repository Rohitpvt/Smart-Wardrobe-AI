import logging
from app.config import settings
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.nvidia_provider import NvidiaProvider

logger = logging.getLogger(__name__)

def get_ai_provider() -> BaseAIProvider:
    """
    Factory function to return the configured AI provider instance.
    """
    provider_name = settings.AI_PROVIDER.lower().strip()
    
    if provider_name == "gemini":
        logger.info("Initializing Gemini AI Provider")
        return GeminiProvider()
    elif provider_name == "nvidia":
        logger.info("Initializing NVIDIA AI Provider")
        return NvidiaProvider()
    elif provider_name == "mock":
        logger.info("Initializing Mock AI Provider")
        return MockProvider()
    else:
        logger.error(f"Unknown AI_PROVIDER: {provider_name}")
        raise ValueError(f"Unknown AI_PROVIDER: {provider_name}. Use 'gemini', 'nvidia', or 'mock'.")
