"""
Gemini AI Provider.

Implements the AIProvider interface using Google's Gemini SDK.
Supports vision analysis, text generation, JSON generation, and chat with tool-calling.
"""

import asyncio
import json
import logging
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.provider import AIProvider
from app.services.ai.schemas import AIClothingExtraction
from app.services.ai.prompts import CLOTHING_ANALYSIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class GeminiProvider:
    """Implementation of AI provider backend using Google's Gemini SDK."""

    def __init__(self, api_key: str | None = None):
        key = api_key or settings.GEMINI_API_KEY
        self.client = genai.Client(api_key=key) if key else None
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
    ) -> tuple[AIClothingExtraction, dict]:
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

        # Request structured output using Pydantic schema
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.model_name,
            contents=[image_part, "Analyze this clothing item."],
            config=types.GenerateContentConfig(
                system_instruction=CLOTHING_ANALYSIS_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AIClothingExtraction,
                temperature=0.1,
            ),
        )

        json_text = response.text
        if not json_text:
            raise ValueError("Received empty response from Gemini")

        extraction = AIClothingExtraction.model_validate_json(json_text)

        # Calculate backend confidence
        backend_conf = self._calculate_backend_confidence(extraction)
        final_confidence = (extraction.confidence_score + backend_conf) // 2
        extraction.confidence_score = final_confidence

        logger.info(f"Successfully analyzed image. Final confidence: {final_confidence}")
        
        usage = {
            "input_tokens": response.usage_metadata.prompt_token_count if response.usage_metadata else None,
            "output_tokens": response.usage_metadata.candidates_token_count if response.usage_metadata else None,
            "total_tokens": response.usage_metadata.total_token_count if response.usage_metadata else None,
        }
        return extraction, usage

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> tuple[str, dict]:
        """Generate plain text using Gemini."""
        if not self.client:
            raise ValueError("Gemini API key is not configured.")

        config = types.GenerateContentConfig(temperature=temperature)
        if system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=temperature,
            )

        def _generate():
            resp = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return resp

        response = await asyncio.wait_for(
            asyncio.to_thread(_generate),
            timeout=timeout,
        )
        usage = {
            "input_tokens": response.usage_metadata.prompt_token_count if response.usage_metadata else None,
            "output_tokens": response.usage_metadata.candidates_token_count if response.usage_metadata else None,
            "total_tokens": response.usage_metadata.total_token_count if response.usage_metadata else None,
        }
        return (response.text or "").strip(), usage

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> tuple[dict, dict]:
        """Generate JSON using Gemini's response_mime_type."""
        if not self.client:
            raise ValueError("Gemini API key is not configured.")

        config_kwargs: dict[str, Any] = {
            "temperature": temperature,
            "response_mime_type": "application/json",
        }
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction

        def _generate():
            return self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs),
            )

        response = await asyncio.wait_for(
            asyncio.to_thread(_generate),
            timeout=timeout,
        )
        usage = {
            "input_tokens": response.usage_metadata.prompt_token_count if response.usage_metadata else None,
            "output_tokens": response.usage_metadata.candidates_token_count if response.usage_metadata else None,
            "total_tokens": response.usage_metadata.total_token_count if response.usage_metadata else None,
        }
        if not response.text:
            return {}, usage
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json), usage

    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
    ) -> tuple[dict[str, Any], dict]:
        """
        Generate a chat response with optional tool-calling using Gemini.

        Accepts messages in OpenAI-compatible format and converts them to Gemini's
        native types.Content format internally.

        Returns normalized: {"text": str|None, "function_calls": [{"name": ..., "args": ...}]|None}
        """
        if not self.client:
            raise ValueError("Gemini API key is not configured.")

        # Convert OpenAI-format messages -> Gemini types.Content
        gemini_contents = []
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            parts = [types.Part.from_text(text=msg["content"])]
            gemini_contents.append(types.Content(role=role, parts=parts))

        # Convert OpenAI-format tools -> Gemini types.Tool
        gemini_tools = None
        if tools:
            func_declarations = []
            for tool in tools:
                func = tool.get("function", {})
                params = func.get("parameters")
                gemini_params = None
                if params:
                    properties = {}
                    for prop_name, prop_def in params.get("properties", {}).items():
                        properties[prop_name] = types.Schema(
                            type=types.Type.STRING,
                            description=prop_def.get("description", ""),
                        )
                    gemini_params = types.Schema(
                        type=types.Type.OBJECT,
                        properties=properties,
                        required=params.get("required", []),
                    )

                func_declarations.append(
                    types.FunctionDeclaration(
                        name=func.get("name", ""),
                        description=func.get("description", ""),
                        parameters=gemini_params,
                    )
                )
            gemini_tools = [types.Tool(function_declarations=func_declarations)]

        config_kwargs: dict[str, Any] = {"temperature": temperature}
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction
        if gemini_tools:
            config_kwargs["tools"] = gemini_tools

        def _call():
            return self.client.models.generate_content(
                model=self.model_name,
                contents=gemini_contents,
                config=types.GenerateContentConfig(**config_kwargs),
            )

        response = await asyncio.wait_for(
            asyncio.to_thread(_call),
            timeout=timeout,
        )

        # Normalize response
        result: dict[str, Any] = {"text": None, "function_calls": None}

        if response.function_calls:
            result["function_calls"] = [
                {"name": fc.name, "args": dict(fc.args) if fc.args else {}}
                for fc in response.function_calls
            ]

        if response.text:
            result["text"] = response.text

        usage = {
            "input_tokens": response.usage_metadata.prompt_token_count if response.usage_metadata else None,
            "output_tokens": response.usage_metadata.candidates_token_count if response.usage_metadata else None,
            "total_tokens": response.usage_metadata.total_token_count if response.usage_metadata else None,
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
            logger.warning("Gemini explanation generation timed out (1.5s). Using fallback.")
            return fallback, {"input_tokens": None, "output_tokens": None, "total_tokens": None}
        except Exception as e:
            logger.error(f"Gemini explanation generation failed: {str(e)}. Using fallback.")
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
            return await self.generate_json(prompt=prompt, temperature=0.7, timeout=3.0)
        except Exception as e:
            logger.error(f"Gemini completion accessory generation failed: {str(e)}")
            return fallback, {"input_tokens": None, "output_tokens": None, "total_tokens": None}


# Singleton instance
gemini_provider = GeminiProvider()
