from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.ai import AIClothingAnalysisResponse

class BaseAIProvider(ABC):
    """
    Abstract base class for all AI providers in Smart Wardrobe AI.
    """
    
    @abstractmethod
    async def analyze_clothing(self, image_url: str, hints: Optional[str] = None) -> AIClothingAnalysisResponse:
        """
        Analyze a clothing image and return normalized categorization data.
        
        :param image_url: A temporary presigned GET URL to the image in S3.
        :param hints: Optional user hints (e.g., "This is a vintage piece").
        :return: AIClothingAnalysisResponse containing the suggestions.
        """
        pass
