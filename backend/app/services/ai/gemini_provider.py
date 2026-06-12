"""
Gemini integration for clothing analysis.
"""

import logging
from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.provider import AIProvider
from app.services.ai.schemas import AIClothingExtraction
from app.services.ai.prompts import CLOTHING_ANALYSIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    """Implementation of AIProvider using Google's Gemini SDK."""
    
    def __init__(self):
        # The client automatically picks up GEMINI_API_KEY from environment variables.
        # We only initialize if the key is present to prevent test suite crashes.
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None
        self.model_name = "gemini-2.5-flash"
        
    def _calculate_backend_confidence(self, extraction: AIClothingExtraction) -> int:
        """
        Calculate an additional backend confidence score based on the completeness 
        of the extracted data.
        """
        score = 100
        
        # Deduct points if crucial fields are missing
        if not extraction.category:
            score -= 30
        if not extraction.clothing_type:
            score -= 20
        if not extraction.color:
            score -= 15
            
        # Optional but helpful fields missing
        if not extraction.pattern:
            score -= 5
        if not extraction.material:
            score -= 5
        if not extraction.season:
            score -= 5
            
        return max(0, score)

    async def analyze_clothing_image(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> AIClothingExtraction:
        """
        Sends the image to Gemini to extract clothing metadata.
        Uses structured outputs (Pydantic schema).
        """
        logger.info(f"Analyzing image with {self.model_name}")
        
        if not self.client:
            raise ValueError("Gemini API key is not configured.")
        
        # Prepare the image part
        image_part = types.Part.from_bytes(
            data=image_data,
            mime_type=mime_type,
        )
        
        try:
            # We use the sync client with asyncio.to_thread to avoid blocking,
            # or the async client if configured. For simplicity, we use the generate_content directly.
            # google-genai supports asyncio but the structure varies, let's use the standard call 
            # and let FastAPI/Starlette threadpool handle it if it's sync, or we can use standard async if supported.
            
            # Request structured output using Pydantic schema
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[image_part, "Analyze this clothing item."],
                config=types.GenerateContentConfig(
                    system_instruction=CLOTHING_ANALYSIS_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=AIClothingExtraction,
                    temperature=0.1, # Low temperature for more deterministic extraction
                ),
            )
            
            # The response text is a JSON string matching the schema.
            # Parse it using our Pydantic model.
            json_text = response.text
            if not json_text:
                raise ValueError("Received empty response from Gemini")
                
            extraction = AIClothingExtraction.model_validate_json(json_text)
            
            # Calculate backend confidence
            backend_conf = self._calculate_backend_confidence(extraction)
            
            # Combine model confidence and backend confidence (average)
            final_confidence = (extraction.confidence_score + backend_conf) // 2
            extraction.confidence_score = final_confidence
            
            logger.info(f"Successfully analyzed image. Final confidence: {final_confidence}")
            return extraction
            
        except Exception as e:
            logger.error(f"Error analyzing image with Gemini: {str(e)}")
            raise

# Singleton instance
gemini_provider = GeminiProvider()
