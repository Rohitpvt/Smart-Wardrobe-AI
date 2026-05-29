import asyncio
import logging
from typing import Optional
from app.ai.base import BaseAIProvider
from app.schemas.ai import AIClothingAnalysisResponse

logger = logging.getLogger(__name__)

class MockProvider(BaseAIProvider):
    """
    A robust mock provider for local testing and UI development.
    Simulates a network delay and returns realistic data.
    """
    async def analyze_clothing(self, image_url: str, hints: Optional[str] = None) -> AIClothingAnalysisResponse:
        logger.info(f"MockProvider analyzing image... (hints: {hints})")
        
        # Simulate network latency of AI processing (1.5 seconds)
        await asyncio.sleep(1.5)
        
        # Return a highly realistic mock response
        return AIClothingAnalysisResponse(
            type="Jacket",
            category="Top Wear",
            primary_color="Blue",
            secondary_color="White",
            pattern="Solid",
            possible_material="Denim",
            season_suggestion="Winter",
            occasion_suggestion="Casual",
            visible_condition="Good",
            confidence_score=0.88,
            explanation="I've analyzed the image and detected a classic blue denim jacket with white accents. It appears to be in good condition and is best suited for casual winter wear."
        )
