"""
Abstract base class for AI providers.

Defines the complete surface area that any AI provider (Gemini, NVIDIA, OpenAI, etc.)
must implement to participate in the AIProviderRouter failover chain.
"""

from abc import ABC, abstractmethod
from typing import Any

from app.services.ai.schemas import AIClothingExtraction


class AIProvider(ABC):
    """Abstract base class for all AI providers."""

    @abstractmethod
    async def analyze_clothing_image(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> AIClothingExtraction:
        """
        Analyze an image and return structured clothing metadata.

        Args:
            image_data: The raw bytes of the image.
            mime_type: The MIME type (e.g., 'image/jpeg').

        Returns:
            AIClothingExtraction: The parsed metadata.
        """
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> str:
        """
        Generate a plain text response from a prompt.

        Args:
            prompt: The user prompt.
            system_instruction: Optional system-level instruction.
            temperature: Sampling temperature.
            timeout: Maximum seconds to wait.

        Returns:
            The generated text string.
        """
        pass

    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> dict:
        """
        Generate a JSON response from a prompt.

        Args:
            prompt: The user prompt requesting JSON output.
            system_instruction: Optional system-level instruction.
            temperature: Sampling temperature.
            timeout: Maximum seconds to wait.

        Returns:
            Parsed JSON as a Python dict.
        """
        pass

    @abstractmethod
    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
    ) -> dict[str, Any]:
        """
        Generate a conversational response, optionally with tool/function calling.

        Args:
            messages: List of {"role": str, "content": str} message dicts.
            system_instruction: Optional system-level instruction.
            tools: Optional list of tool definitions in OpenAI-compatible format.
            temperature: Sampling temperature.
            timeout: Maximum seconds to wait.

        Returns:
            Normalized dict:
            {
                "text": str | None,
                "function_calls": [{"name": str, "args": dict}] | None
            }
        """
        pass

    @abstractmethod
    async def generate_outfit_explanation(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        occasion: str,
        weather: dict | None,
        scores: dict | None,
        style_dna: str | None = None,
        rotation_context: str | None = None,
    ) -> str:
        """
        Generate a 1-sentence stylist explanation for why the outfit works.
        """
        pass

    @abstractmethod
    async def generate_outfit_completion_accessories(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        outerwear_name: str | None,
        anchor_type: str,
        styling_preference: str,
    ) -> dict:
        """
        Generate accessories and styling reasoning for a completed outfit.
        Returns {"reasoning": str, "accessories": dict}.
        """
        pass
