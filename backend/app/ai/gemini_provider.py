import logging
import json
import httpx
from typing import Optional
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.ai.base import BaseAIProvider
from app.schemas.ai import AIClothingAnalysisResponse
from app.config import settings

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

class GeminiProvider(BaseAIProvider):
    """
    Google Gemini API integration using google-genai SDK.
    """
    async def analyze_clothing(self, image_url: str, hints: Optional[str] = None) -> AIClothingAnalysisResponse:
        if not settings.GEMINI_API_KEY:
            logger.error("Gemini API key is missing.")
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Gemini API key is not configured."
            )
            
        if genai is None:
            logger.error("google-genai SDK is not installed.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini SDK is missing."
            )

        logger.info(f"GeminiProvider analyzing image: {image_url[:50]}...")
        
        # 1. Download image bytes
        try:
            async with httpx.AsyncClient() as http_client:
                response = await http_client.get(image_url, timeout=15.0)
                response.raise_for_status()
                image_bytes = response.content
                content_type = response.headers.get("content-type", "image/jpeg")
        except Exception as e:
            logger.error(f"Failed to download image from S3: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve the image for AI analysis."
            )

        # 2. Prepare Gemini client and prompt
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.0-flash")
            
            prompt = (
                "You are an expert AI fashion assistant. Analyze this clothing image.\n"
                "Return ONLY a valid, raw JSON object matching exactly this schema:\n"
                "{\n"
                "  \"type\": \"string (top, bottom, footwear, accessory)\",\n"
                "  \"category\": \"string (e.g. t-shirt, jeans, sneakers, jacket, watch)\",\n"
                "  \"primary_color\": \"string\",\n"
                "  \"secondary_color\": \"string or null\",\n"
                "  \"pattern\": \"string (e.g. solid, striped, floral)\",\n"
                "  \"possible_material\": \"string or null\",\n"
                "  \"season_suggestion\": \"string (Summer, Winter, Spring, Autumn, All)\",\n"
                "  \"occasion_suggestion\": \"string (Casual, Formal, Athletic, Party, Smart Casual)\",\n"
                "  \"visible_condition\": \"string (e.g. good, wrinkled, worn)\",\n"
                "  \"confidence_score\": number (0.0 to 1.0),\n"
                "  \"explanation\": \"string (brief styling advice)\"\n"
                "}\n"
            )
            if hints:
                prompt += f"\nUser provided hints: {hints}\n"
            
            # Format image part for google-genai
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=content_type,
            )
            
            # Generate content
            # Note: We use synchronous generate_content wrapped or just call it directly as async support might vary,
            # but httpx download was async. `google-genai` supports `client.aio.models.generate_content`.
            if hasattr(client, "aio"):
                result = await client.aio.models.generate_content(
                    model=model_name,
                    contents=[image_part, prompt],
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
            else:
                # Fallback to sync if aio is not available
                result = client.models.generate_content(
                    model=model_name,
                    contents=[image_part, prompt],
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                
            json_text = result.text.strip()
            # Clean markdown formatting if present
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
                
            parsed_data = json.loads(json_text)
            
            # Validate with Pydantic
            response_obj = AIClothingAnalysisResponse(**parsed_data)
            return response_obj
            
        except json.JSONDecodeError as e:
            logger.error(f"Gemini returned malformed JSON: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provided an invalid response format."
            )
        except ValidationError as e:
            logger.error(f"Gemini response failed schema validation: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI response did not match the expected schema."
            )
        except Exception as e:
            error_str = str(e)
            logger.error(f"Gemini API call failed: {error_str}")

            # Surface quota exhaustion clearly instead of generic 502
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                raise HTTPException(
                    status_code=429,
                    detail="Gemini API quota exhausted. The free-tier daily limit has been reached. "
                           "Please wait, upgrade your billing plan, or switch AI_PROVIDER to 'mock'."
                )

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to analyze image using Gemini AI."
            )
