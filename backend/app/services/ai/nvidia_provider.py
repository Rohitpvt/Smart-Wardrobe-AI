"""
NVIDIA NIM AI Provider.

Implements the AIProvider interface using NVIDIA NIM's OpenAI-compatible API.
Uses the `openai` Python SDK pointed at NVIDIA's cloud endpoint.

Models:
  - Text/JSON/Chat: meta/llama-3.3-70b-instruct
  - Vision/Image:   microsoft/phi-4-multimodal-instruct
"""

import asyncio
import base64
import json
import logging
from typing import Any

from app.core.config import settings
from app.services.ai.provider import AIProvider
from app.services.ai.schemas import AIClothingExtraction
from app.services.ai.prompts import CLOTHING_ANALYSIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"


class NvidiaProvider:
    """Implementation of AI provider backend using NVIDIA NIM."""

    def __init__(self):
        self.client = None
        self.text_model = "meta/llama-3.3-70b-instruct"
        self.vision_model = "microsoft/phi-4-multimodal-instruct"

        if settings.NVIDIA_API_KEY:
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    base_url=NVIDIA_BASE_URL,
                    api_key=settings.NVIDIA_API_KEY,
                )
            except ImportError:
                logger.warning("openai package not installed. NVIDIA provider unavailable.")

    async def analyze_clothing_image(
        self,
        image_data: bytes,
        mime_type: str,
    ) -> tuple[AIClothingExtraction, dict]:
        """
        Analyze a clothing image using NVIDIA's VLM (phi-4-multimodal-instruct).
        Encodes the image as base64 and sends via OpenAI-compatible chat completion.
        """
        logger.info(f"[NVIDIA] Analyzing image with {self.vision_model}")

        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        b64_image = base64.b64encode(image_data).decode("utf-8")
        data_uri = f"data:{mime_type};base64,{b64_image}"

        prompt_text = (
            "Analyze this clothing item. "
            "Return ONLY valid JSON matching this schema: "
            '{"name": str, "category": "TOPWEAR"|"BOTTOMWEAR"|"FOOTWEAR"|"OUTERWEAR"|"ACCESSORY"|null, '
            '"clothing_type": str|null, "color": str|null, "pattern": str|null, '
            '"material": str|null, "season": "SUMMER"|"WINTER"|"SPRING"|"AUTUMN"|"ALL_SEASON"|null, '
            '"brand": str|null, "confidence_score": int (0-100)}'
        )

        response = await asyncio.wait_for(
            asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.vision_model,
                messages=[
                    {"role": "system", "content": CLOTHING_ANALYSIS_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "image_url", "image_url": {"url": data_uri}},
                            {"type": "text", "text": prompt_text},
                        ],
                    },
                ],
                max_tokens=512,
                temperature=0.1,
            ),
            timeout=15.0,
        )

        json_content = response.choices[0].message.content or ""
        try:
            clean = json_content.replace("```json", "").replace("```", "").strip()
            extraction = AIClothingExtraction.model_validate_json(clean)
        except Exception as e:
            logger.error(f"NVIDIA vision parsing failed: {str(e)}. Body: {json_content}")
            raise

        # Apply backend confidence adjustment
        score = 100
        if not extraction.category: score -= 30
        if not extraction.clothing_type: score -= 20
        if not extraction.color: score -= 15
        if not extraction.pattern: score -= 5
        if not extraction.material: score -= 5
        if not extraction.season: score -= 5
        score = max(0, score)
        extraction.confidence_score = (extraction.confidence_score + score) // 2

        logger.info(f"Successfully analyzed image with NVIDIA. Confidence: {extraction.confidence_score}")
        
        usage = {
            "input_tokens": response.usage.prompt_tokens if getattr(response, "usage", None) else None,
            "output_tokens": response.usage.completion_tokens if getattr(response, "usage", None) else None,
            "total_tokens": response.usage.total_tokens if getattr(response, "usage", None) else None,
        }
        return extraction, usage

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> tuple[str, dict]:
        """Generate plain text using NVIDIA NIM."""
        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = await asyncio.wait_for(
            asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.text_model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
            ),
            timeout=timeout,
        )
        
        usage = {
            "input_tokens": response.usage.prompt_tokens if getattr(response, "usage", None) else None,
            "output_tokens": response.usage.completion_tokens if getattr(response, "usage", None) else None,
            "total_tokens": response.usage.total_tokens if getattr(response, "usage", None) else None,
        }
        return (response.choices[0].message.content or "").strip(), usage

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> tuple[dict, dict]:
        """Generate JSON using NVIDIA NIM with JSON-mode prompting."""
        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        messages = []
        sys_msg = (system_instruction or "") + "\nYou MUST respond with ONLY valid JSON. No markdown, no explanations."
        messages.append({"role": "system", "content": sys_msg.strip()})
        messages.append({"role": "user", "content": prompt})

        response = await asyncio.wait_for(
            asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.text_model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
                response_format={"type": "json_object"}
            ),
            timeout=timeout,
        )
        
        usage = {
            "input_tokens": response.usage.prompt_tokens if getattr(response, "usage", None) else None,
            "output_tokens": response.usage.completion_tokens if getattr(response, "usage", None) else None,
            "total_tokens": response.usage.total_tokens if getattr(response, "usage", None) else None,
        }

        content = response.choices[0].message.content
        if not content:
            return {}, usage

        clean_json = content.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json), usage

    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
    ) -> tuple[dict[str, Any], dict]:
        """Generate a chat response with optional tool-calling using NVIDIA NIM."""
        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        api_messages = []
        if system_instruction:
            api_messages.append({"role": "system", "content": system_instruction})
        api_messages.extend(messages)

        call_kwargs: dict[str, Any] = {
            "model": self.text_model,
            "messages": api_messages,
            "temperature": temperature,
            "max_tokens": 2048,
        }
        if tools:
            call_kwargs["tools"] = tools
            call_kwargs["tool_choice"] = "auto"

        response = await asyncio.wait_for(
            asyncio.to_thread(self.client.chat.completions.create, **call_kwargs),
            timeout=timeout,
        )

        msg = response.choices[0].message
        result: dict[str, Any] = {"text": msg.content if msg.content else None, "function_calls": None}

        if msg.tool_calls:
            result["function_calls"] = [
                {"name": tc.function.name, "args": json.loads(tc.function.arguments)}
                for tc in msg.tool_calls
            ]

        usage = {
            "input_tokens": response.usage.prompt_tokens if getattr(response, "usage", None) else None,
            "output_tokens": response.usage.completion_tokens if getattr(response, "usage", None) else None,
            "total_tokens": response.usage.total_tokens if getattr(response, "usage", None) else None,
        }
        return result, usage

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
    ) -> tuple[str, dict]:
        fallback = "This combination was selected based on your wardrobe preferences and color profile."

        weather_str = ""
        if weather and weather.get("weather_used"):
            temp = weather.get("temperature_celsius", "")
            cond = weather.get("condition", "")
            wind = weather.get("wind_speed")
            wind_str = f" with wind speed of {wind}m/s" if wind else ""
            weather_str = f"The current weather is {temp}°C and {cond}{wind_str}."

        score_str = ""
        if scores:
            ov = scores.get("overall_score")
            util = scores.get("utilization_score")
            col = scores.get("color_score")
            score_str = f"The outfit scored {ov}/100 overall (Color Harmony: {col}, Wardrobe Utilization: {util})."

        prompt = f"""
You are a concise fashion stylist. Explain why this outfit works in exactly ONE short sentence.
Reference the weather conditions (like wind or temperature if relevant) or how it utilizes the wardrobe.
Do not use lists. Just one sentence.

Occasion: {occasion}
{weather_str}
{score_str}
{f"Style Profile: {style_dna}" if style_dna else ""}
{f"Rotation Note: {rotation_context}" if rotation_context else ""}
Top: {top_name}
Bottom: {bottom_name}
Footwear: {footwear_name}
"""
        try:
            return await self.generate_text(prompt=prompt, temperature=0.7, timeout=1.5)
        except asyncio.TimeoutError:
            logger.warning("NVIDIA explanation generation timed out (1.5s). Using fallback.")
            return fallback, {"input_tokens": None, "output_tokens": None, "total_tokens": None}
        except Exception as e:
            logger.error(f"NVIDIA explanation generation failed: {str(e)}. Using fallback.")
            return fallback, {"input_tokens": None, "output_tokens": None, "total_tokens": None}

    async def generate_outfit_completion_accessories(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        outerwear_name: str | None,
        anchor_type: str,
        styling_preference: str,
    ) -> tuple[dict, dict]:
        fallback = (
            {
                "reasoning": "This combination builds a balanced aesthetic around your chosen item.",
                "accessories": {"Style Note": "Minimal accessories recommended."},
            },
            {"input_tokens": None, "output_tokens": None, "total_tokens": None}
        )

        outer_str = f"Outerwear: {outerwear_name}\n" if outerwear_name else ""

        prompt = f"""
        You are a highly skilled fashion stylist. An outfit has been built around an anchor item.
        The user's styling preference is '{styling_preference}'.

        If styling_preference is 'masculine': Recommend items like Belt, Watch, Layering.
        If styling_preference is 'feminine': Recommend items like Makeup, Lipstick color, Jewelry, Bag.
        If styling_preference is 'neutral': Recommend items like Watch, Bag, general accessories.

        Provide exactly two things:
        1. "reasoning": A 1-2 sentence explanation of why this outfit works visually, specifically mentioning the anchor item type ({anchor_type}).
        2. "accessories": A JSON object mapping accessory types to specific recommendations (e.g. {{"Belt": "Brown Leather", "Watch": "Silver"}}).

        Current Outfit:
        Top: {top_name}
        Bottom: {bottom_name}
        Footwear: {footwear_name}
        {outer_str}

        Respond with ONLY a valid JSON object matching the requested structure.
        """
        try:
            return await self.generate_json(prompt=prompt, temperature=0.7, timeout=3.0)
        except Exception as e:
            logger.error(f"NVIDIA completion accessory generation failed: {str(e)}")
            return fallback


# Singleton instance
nvidia_provider = NvidiaProvider()
