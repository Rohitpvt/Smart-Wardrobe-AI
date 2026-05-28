"""
Smart Wardrobe AI — AI Provider Factory

Factory pattern to instantiate the correct AI provider based on
the AI_PROVIDER environment variable.

Usage:
    from app.services.ai.factory import get_ai_provider
    provider = get_ai_provider()
    result = await provider.analyze_clothing(image_bytes)
"""

from app.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.mock_provider import MockAIProvider


def get_ai_provider(provider_name: str | None = None) -> AIProvider:
    """
    Return an AI provider instance based on the provider name.

    Args:
        provider_name: Override for the provider. If None, reads from
                       settings.AI_PROVIDER environment variable.

    Returns:
        An instance of AIProvider.

    Raises:
        ValueError: If the provider name is not recognized.
    """
    name = (provider_name or settings.AI_PROVIDER).lower().strip()

    if name == "mock":
        return MockAIProvider()

    # Phase 3+: Add real providers here
    # elif name == "gemini":
    #     from app.services.ai.gemini_provider import GeminiAIProvider
    #     return GeminiAIProvider()
    # elif name == "nvidia":
    #     from app.services.ai.nvidia_provider import NVIDIANIMProvider
    #     return NVIDIANIMProvider()
    # elif name == "huggingface":
    #     from app.services.ai.hf_provider import HuggingFaceProvider
    #     return HuggingFaceProvider()

    raise ValueError(
        f"Unknown AI provider: '{name}'. "
        f"Valid options: mock, gemini, nvidia, huggingface. "
        f"Set AI_PROVIDER in your .env file."
    )
