"""
Smart Wardrobe AI — AI Provider Abstract Base Class

Defines the interface that all AI providers must implement.
This abstraction layer allows swapping between different AI backends
(Mock, Gemini Vision, NVIDIA NIM, Hugging Face) without changing
the rest of the application code.

Usage:
    provider = get_ai_provider("mock")
    analysis = await provider.analyze_clothing(image_bytes)
    recommendation = await provider.recommend_outfit(wardrobe, context)
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from dataclasses import dataclass


@dataclass
class ClothingAnalysis:
    """Result of AI clothing image analysis."""

    category: str          # e.g., "top", "bottom", "shoes"
    sub_category: str      # e.g., "t-shirt", "jeans", "sneakers"
    color_primary: str     # e.g., "navy blue"
    color_secondary: Optional[str] = None
    pattern: str = "solid"  # e.g., "solid", "striped", "plaid"
    material: Optional[str] = None  # e.g., "cotton", "denim"
    season: Optional[List[str]] = None  # e.g., ["spring", "summer"]
    occasion: Optional[List[str]] = None  # e.g., ["casual", "sport"]
    confidence: float = 0.0  # 0.0 to 1.0
    tags: Optional[Dict[str, Any]] = None  # Additional AI-generated tags


@dataclass
class OutfitRecommendation:
    """Result of AI outfit recommendation."""

    clothing_item_ids: List[str]  # UUIDs of recommended items
    outfit_name: str
    occasion: str
    reasoning: str              # Why this outfit was recommended
    style_score: float = 0.0    # 0.0 to 1.0
    weather_appropriate: bool = True
    color_harmony_score: float = 0.0


class AIProvider(ABC):
    """
    Abstract base class for AI providers.

    All AI providers (Mock, Gemini, NVIDIA NIM, Hugging Face) must
    implement these methods. The application code uses this interface
    exclusively, making provider swaps transparent.
    """

    @abstractmethod
    async def analyze_clothing(
        self, image_bytes: bytes, mime_type: str = "image/jpeg"
    ) -> ClothingAnalysis:
        """
        Analyze a clothing image and extract metadata.

        Args:
            image_bytes: Raw image data
            mime_type: Image MIME type (jpeg, png, webp)

        Returns:
            ClothingAnalysis with detected attributes
        """
        ...

    @abstractmethod
    async def recommend_outfit(
        self,
        wardrobe: List[Dict[str, Any]],
        context: Dict[str, Any],
    ) -> OutfitRecommendation:
        """
        Generate an outfit recommendation from wardrobe items.

        Args:
            wardrobe: List of clothing item dicts from database
            context: Dict with keys like "occasion", "weather", "season",
                     "gender", "style_preference"

        Returns:
            OutfitRecommendation with selected items and reasoning
        """
        ...

    @abstractmethod
    async def describe_outfit(
        self, items: List[Dict[str, Any]]
    ) -> str:
        """
        Generate a natural language description of an outfit.

        Args:
            items: List of clothing item dicts

        Returns:
            Human-readable outfit description
        """
        ...
