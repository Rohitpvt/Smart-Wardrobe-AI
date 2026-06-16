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


class NvidiaProvider(AIProvider):
    """Implementation of AIProvider using NVIDIA NIM (OpenAI-compatible API)."""

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
    ) -> AIClothingExtraction:
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

        def _call():
            return self.client.chat.completions.create(
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
            )

        response = await asyncio.wait_for(
            asyncio.to_thread(_call),
            timeout=15.0,
        )

        text = response.choices[0].message.content or ""
        # Strip markdown wrappers
        clean = text.replace("```json", "").replace("```", "").strip()
        extraction = AIClothingExtraction.model_validate_json(clean)

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

        logger.info(f"[NVIDIA] Image analysis complete. Confidence: {extraction.confidence_score}")
        return extraction

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> str:
        """Generate plain text using NVIDIA NIM."""
        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        def _call():
            return self.client.chat.completions.create(
                model=self.text_model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
            )

        response = await asyncio.wait_for(
            asyncio.to_thread(_call),
            timeout=timeout,
        )
        return (response.choices[0].message.content or "").strip()

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> dict:
        """Generate JSON using NVIDIA NIM with JSON-mode prompting."""
        if not self.client:
            raise ValueError("NVIDIA API key is not configured.")

        messages = []
        sys_msg = (system_instruction or "") + "\nYou MUST respond with ONLY valid JSON. No markdown, no explanations."
        messages.append({"role": "system", "content": sys_msg.strip()})
        messages.append({"role": "user", "content": prompt})

        def _call():
            return self.client.chat.completions.create(
                model=self.text_model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
            )

        response = await asyncio.wait_for(
            asyncio.to_thread(_call),
            timeout=timeout,
        )

        text = (response.choices[0].message.content or "").strip()
        if not text:
            return {}
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)

    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
    ) -> dict[str, Any]:
        """
        Generate a chat response with optional tool-calling using NVIDIA NIM.

        Uses the OpenAI-compatible tools parameter.

        Returns normalized: {"text": str|None, "function_calls": [{"name": ..., "args": ...}]|None}
        """
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

        def _call():
            return self.client.chat.completions.create(**call_kwargs)

        response = await asyncio.wait_for(
            asyncio.to_thread(_call),
            timeout=timeout,
        )

        choice = response.choices[0]
        result: dict[str, Any] = {"text": None, "function_calls": None}

        # Parse tool calls
        if choice.message.tool_calls:
            result["function_calls"] = []
            for tc in choice.message.tool_calls:
                args = {}
                if tc.function.arguments:
                    try:
                        args = json.loads(tc.function.arguments)
                    except json.JSONDecodeError:
                        args = {"raw": tc.function.arguments}
                result["function_calls"].append({
                    "name": tc.function.name,
                    "args": args,
                })

        if choice.message.content:
            result["text"] = choice.message.content

        return result

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
            return await self.generate_text(prompt=prompt, temperature=0.7, timeout=5.0)
        except Exception as e:
            logger.error(f"[NVIDIA] Explanation generation failed: {e}")
            return fallback

    async def generate_outfit_completion_accessories(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        outerwear_name: str | None,
        anchor_type: str,
        styling_preference: str,
    ) -> dict:
        fallback = {
            "reasoning": "This combination builds a balanced aesthetic around your chosen item.",
            "accessories": {"Style Note": "Minimal accessories recommended."},
        }

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
            return await self.generate_json(prompt=prompt, temperature=0.7, timeout=5.0)
        except Exception as e:
            logger.error(f"[NVIDIA] Accessory generation failed: {e}")
            return fallback


# Singleton instance
nvidia_provider = NvidiaProvider()
