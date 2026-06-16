"""
AI Provider Router — Multi-Provider Failover Layer.

Routes all AI requests through a primary → fallback provider chain.
Implements the same AIProvider interface so all consumers remain decoupled.

Failover triggers:
  - 429 (RESOURCE_EXHAUSTED, RATE_LIMIT)
  - 500, 502, 503, 504
  - TimeoutError

Non-failover (errors propagated immediately):
  - 400 (INVALID_ARGUMENT)
  - 401 (UNAUTHORIZED)
  - 403 (FORBIDDEN)
"""

import logging
import time
from typing import Any

from app.core.config import settings
from app.services.ai.provider import AIProvider
from app.services.ai.schemas import AIClothingExtraction

logger = logging.getLogger(__name__)

# Error substrings that indicate provider-side failures → trigger failover
FAILOVER_TRIGGERS = (
    "429", "resource_exhausted", "rate_limit", "rate limit",
    "quota", "500", "502", "503", "504",
    "service unavailable", "bad gateway", "gateway timeout",
    "server error", "overloaded",
)

# Error substrings that indicate client-side/validation errors → NO failover
NON_FAILOVER_TRIGGERS = (
    "400", "invalid_argument", "invalid argument",
    "401", "unauthorized", "unauthenticated",
    "403", "forbidden", "permission_denied",
)


class AIProviderRouter(AIProvider):
    """
    Routes AI requests to primary → fallback provider with automatic failover.

    All AI services consume this router instead of individual providers directly.
    The router is transparent: callers cannot and should not know which provider
    answered the request.
    """

    def __init__(self):
        from app.services.ai.gemini_provider import GeminiProvider
        from app.services.ai.nvidia_provider import NvidiaProvider

        self._providers: dict[str, AIProvider] = {
            "gemini": GeminiProvider(),
            "nvidia": NvidiaProvider(),
        }

        self.primary_name = settings.AI_PRIMARY_PROVIDER.lower()
        self.fallback_name = settings.AI_FALLBACK_PROVIDER.lower()

        if self.primary_name not in self._providers:
            logger.warning(f"[AI_PROVIDER] Unknown primary provider '{self.primary_name}', defaulting to gemini")
            self.primary_name = "gemini"
        if self.fallback_name not in self._providers:
            logger.warning(f"[AI_PROVIDER] Unknown fallback provider '{self.fallback_name}', defaulting to nvidia")
            self.fallback_name = "nvidia"

        self.primary = self._providers[self.primary_name]
        self.fallback = self._providers[self.fallback_name]

        logger.info(
            f"[AI_PROVIDER] Router initialized: primary={self.primary_name}, fallback={self.fallback_name}"
        )

    def _is_failover_eligible(self, error: Exception) -> bool:
        """
        Determine whether an error should trigger failover to the next provider.

        Returns True if the error is a provider-side failure (quota, rate limit, server error).
        Returns False if the error is a client-side issue (bad prompt, auth error).
        """
        error_str = str(error).lower()

        # Check non-failover triggers first (higher priority)
        for trigger in NON_FAILOVER_TRIGGERS:
            if trigger in error_str:
                return False

        # Check failover triggers
        for trigger in FAILOVER_TRIGGERS:
            if trigger in error_str:
                return True

        # TimeoutError is always a failover trigger
        if isinstance(error, (TimeoutError, asyncio.TimeoutError)):
            return True

        # Default: don't failover on unknown errors (safer)
        return False

    async def _execute_with_failover(self, method_name: str, *args, **kwargs) -> Any:
        """
        Core failover logic. Attempts the primary provider, fails over to the
        fallback provider if a retriable error occurs.
        """
        providers = [
            (self.primary_name, self.primary),
            (self.fallback_name, self.fallback),
        ]

        last_error = None

        for provider_name, provider in providers:
            start_time = time.monotonic()
            try:
                method = getattr(provider, method_name)
                result = await method(*args, **kwargs)
                elapsed_ms = round((time.monotonic() - start_time) * 1000, 1)

                logger.info(
                    f"[AI_PROVIDER] {provider_name} Success | "
                    f"method={method_name} | "
                    f"provider_used={provider_name} | "
                    f"response_time_ms={elapsed_ms}"
                )
                return result

            except Exception as e:
                elapsed_ms = round((time.monotonic() - start_time) * 1000, 1)
                last_error = e

                if not self._is_failover_eligible(e):
                    # Non-retriable error — propagate immediately
                    logger.error(
                        f"[AI_PROVIDER] {provider_name} Non-Retriable Error | "
                        f"method={method_name} | "
                        f"provider_used={provider_name} | "
                        f"response_time_ms={elapsed_ms} | "
                        f"error={str(e)[:200]}"
                    )
                    raise

                # Retriable error — log and try next provider
                logger.warning(
                    f"[AI_PROVIDER] {provider_name} Failed | "
                    f"method={method_name} | "
                    f"provider_used={provider_name} | "
                    f"failover_trigger={type(e).__name__} | "
                    f"response_time_ms={elapsed_ms} | "
                    f"error={str(e)[:200]}"
                )

                if provider_name == self.fallback_name:
                    # Both providers failed
                    logger.error(
                        f"[AI_PROVIDER] All Providers Failed | "
                        f"method={method_name} | "
                        f"error={str(e)[:200]}"
                    )
                    raise
                else:
                    logger.info(
                        f"[AI_PROVIDER] Switching To {self.fallback_name} | "
                        f"failover_trigger={type(e).__name__}"
                    )
                    continue

        # Should not reach here, but just in case
        if last_error:
            raise last_error
        raise RuntimeError("[AI_PROVIDER] No providers available")

    # ──────────────────────────────────────────────
    # AIProvider Interface Implementation
    # ──────────────────────────────────────────────

    async def analyze_clothing_image(
        self, image_data: bytes, mime_type: str
    ) -> AIClothingExtraction:
        return await self._execute_with_failover(
            "analyze_clothing_image", image_data, mime_type
        )

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> str:
        return await self._execute_with_failover(
            "generate_text",
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            timeout=timeout,
        )

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
    ) -> dict:
        return await self._execute_with_failover(
            "generate_json",
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            timeout=timeout,
        )

    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
    ) -> dict[str, Any]:
        return await self._execute_with_failover(
            "generate_chat_response",
            messages=messages,
            system_instruction=system_instruction,
            tools=tools,
            temperature=temperature,
            timeout=timeout,
        )

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
        return await self._execute_with_failover(
            "generate_outfit_explanation",
            top_name=top_name,
            bottom_name=bottom_name,
            footwear_name=footwear_name,
            occasion=occasion,
            weather=weather,
            scores=scores,
            style_dna=style_dna,
            rotation_context=rotation_context,
        )

    async def generate_outfit_completion_accessories(
        self,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        outerwear_name: str | None,
        anchor_type: str,
        styling_preference: str,
    ) -> dict:
        return await self._execute_with_failover(
            "generate_outfit_completion_accessories",
            top_name=top_name,
            bottom_name=bottom_name,
            footwear_name=footwear_name,
            outerwear_name=outerwear_name,
            anchor_type=anchor_type,
            styling_preference=styling_preference,
        )


# We need asyncio import for TimeoutError check
import asyncio  # noqa: E402

# Singleton instance — this is the global entry point for all AI operations
ai_provider = AIProviderRouter()
