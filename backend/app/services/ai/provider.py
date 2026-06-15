"""
Abstract base class for AI providers.
Allows easy swapping of models if needed in the future.
"""

from abc import ABC, abstractmethod
from typing import BinaryIO

from app.services.ai.schemas import AIClothingExtraction


class AIProvider(ABC):
    """Abstract base class for AI Image Analysis providers."""

    @abstractmethod
    async def analyze_clothing_image(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> AIClothingExtraction:
        """
        Analyze an image and return structured metadata.
        
        Args:
            image_data: The raw bytes of the image.
            mime_type: The MIME type (e.g., 'image/jpeg').
            
        Returns:
            AIClothingExtraction: The parsed metadata.
        """
        pass

    @abstractmethod
    async def generate_outfit_explanation(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        occasion: str,
        weather_condition: str | None,
        temperature: float | None
    ) -> str:
        """
        Generate a 1-sentence stylist explanation for why the outfit works.
        """
        pass
