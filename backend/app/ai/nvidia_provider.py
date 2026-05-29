import logging
import json
import base64
import httpx
from typing import Optional
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.ai.base import BaseAIProvider
from app.schemas.ai import AIClothingAnalysisResponse
from app.config import settings

logger = logging.getLogger(__name__)


class NvidiaProvider(BaseAIProvider):
    """
    NVIDIA NIM API integration for clothing image analysis.
    Uses OpenAI-compatible chat/completions endpoint with vision support.
    """

    SYSTEM_PROMPT = (
        "You are a clothing analysis engine. "
        "You receive an image of a clothing item and return ONLY valid JSON — "
        "no markdown, no explanation, no extra text. "
        "The JSON must exactly match this schema:\n"
        "{\n"
        '  "type": "string (e.g. T-Shirt, Jeans, Sneakers, Jacket, Dress)",\n'
        '  "category": "string (e.g. Top Wear, Bottom Wear, Footwear, Accessories)",\n'
        '  "primary_color": "string",\n'
        '  "secondary_color": "string or null",\n'
        '  "pattern": "string (e.g. Solid, Striped, Floral, Checkered, Abstract)",\n'
        '  "possible_material": "string or null (e.g. Cotton, Denim, Leather, Polyester)",\n'
        '  "season_suggestion": "string (Summer, Winter, Spring, Autumn, All)",\n'
        '  "occasion_suggestion": "string (Casual, Formal, Athletic, Party, Smart Casual)",\n'
        '  "visible_condition": "string (e.g. Good, Wrinkled, Worn, New)",\n'
        '  "confidence_score": number (0.0 to 1.0),\n'
        '  "explanation": "string (brief styling advice, 1-2 sentences)"\n'
        "}\n"
    )

    async def analyze_clothing(
        self, image_url: str, hints: Optional[str] = None
    ) -> AIClothingAnalysisResponse:
        # ── Validate configuration ──────────────────────────────────
        if not settings.NVIDIA_API_KEY:
            logger.error("NVIDIA_API_KEY is missing from environment.")
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="NVIDIA API key is not configured.",
            )

        nvidia_base = settings.NVIDIA_BASE_URL.rstrip("/")
        model_name = settings.NVIDIA_MODEL
        logger.info(f"NvidiaProvider analyzing image with model={model_name}")

        # ── 1. Download image bytes from presigned S3 URL ───────────
        try:
            async with httpx.AsyncClient() as http_client:
                img_resp = await http_client.get(image_url, timeout=15.0)
                img_resp.raise_for_status()
                image_bytes = img_resp.content
                content_type = img_resp.headers.get("content-type", "image/jpeg")
                # Normalise MIME: keep only the main type (strip charset etc.)
                mime_type = content_type.split(";")[0].strip()
                if mime_type not in ("image/jpeg", "image/png", "image/webp"):
                    mime_type = "image/jpeg"
        except httpx.TimeoutException:
            logger.error("Timeout downloading image from S3 for AI analysis.")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Timed out downloading the image for AI analysis.",
            )
        except Exception as e:
            logger.error(f"Failed to download image from S3: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve the image for AI analysis.",
            )

        # ── 2. Base64-encode the image ──────────────────────────────
        b64_data = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_data}"

        # ── 3. Build the user prompt ────────────────────────────────
        user_text = "Analyze this clothing image. Return ONLY the JSON object."
        if hints:
            user_text += f"\nUser hints: {hints}"

        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {
                        "type": "image_url",
                        "image_url": {"url": data_url},
                    },
                ],
            },
        ]

        payload = {
            "model": model_name,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.2,
            "stream": False,
        }

        # ── 4. Call NVIDIA NIM API ──────────────────────────────────
        try:
            async with httpx.AsyncClient() as http_client:
                api_resp = await http_client.post(
                    f"{nvidia_base}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=60.0,  # Vision models can be slow
                )
        except httpx.TimeoutException:
            logger.error("Timeout calling NVIDIA NIM API.")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="AI analysis timed out. Please try again.",
            )
        except Exception as e:
            logger.error(f"Network error calling NVIDIA NIM: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to reach the AI analysis service.",
            )

        # ── 5. Handle HTTP-level errors from NVIDIA ─────────────────
        if api_resp.status_code != 200:
            error_body = api_resp.text[:500]  # Truncate for safety (no key leak)
            logger.error(
                f"NVIDIA API returned HTTP {api_resp.status_code}: {error_body}"
            )

            if api_resp.status_code in (401, 403):
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="AI provider authentication failed. Check NVIDIA_API_KEY.",
                )
            if api_resp.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="AI provider quota exhausted. Please try again later or switch AI_PROVIDER to mock.",
                )
            if api_resp.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="AI provider rejected the request. The model may not support vision input.",
                )

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI provider error (HTTP {api_resp.status_code}).",
            )

        # ── 6. Parse the response ───────────────────────────────────
        try:
            resp_json = api_resp.json()
            raw_content = resp_json["choices"][0]["message"]["content"]
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            logger.error(f"Unexpected NVIDIA response structure: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI returned an unexpected response format.",
            )

        # ── 7. Clean & parse the AI-generated JSON ──────────────────
        json_text = raw_content.strip()
        # Strip markdown code fences if present
        if json_text.startswith("```json"):
            json_text = json_text[7:]
        elif json_text.startswith("```"):
            json_text = json_text[3:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
        json_text = json_text.strip()

        try:
            parsed_data = json.loads(json_text)
        except json.JSONDecodeError as e:
            logger.error(f"NVIDIA model returned invalid JSON: {e}. Raw: {json_text[:200]}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provided an invalid response format.",
            )

        # ── 8. Validate against Pydantic schema ────────────────────
        try:
            # Fill safe defaults for optional fields the model may omit
            parsed_data.setdefault("confidence_score", 0.75)
            parsed_data.setdefault("explanation", "AI analysis completed.")
            response_obj = AIClothingAnalysisResponse(**parsed_data)
            return response_obj
        except ValidationError as e:
            logger.error(f"NVIDIA response failed schema validation: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI response did not match the expected schema.",
            )
