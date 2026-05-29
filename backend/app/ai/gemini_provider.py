import logging
from typing import Optional
from fastapi import HTTPException, status
from app.ai.base import BaseAIProvider
from app.schemas.ai import AIClothingAnalysisResponse
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(BaseAIProvider):
    """
    Placeholder for Google Gemini API integration (Phase 5).
    """
    async def analyze_clothing(self, image_url: str, hints: Optional[str] = None) -> AIClothingAnalysisResponse:
        if not settings.GEMINI_API_KEY:
            logger.error("Gemini API key is missing.")
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Gemini AI is not fully configured yet."
            )
            
        logger.info("GeminiProvider called, but logic is pending.")
        
        # TODO: Implement real Gemini Vision API call here using google-genai SDK.
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Real Gemini integration is pending Phase 5."
        )
