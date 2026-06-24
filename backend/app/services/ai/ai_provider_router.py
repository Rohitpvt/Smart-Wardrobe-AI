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

    def _classify_error(self, error: Exception) -> str | None:
        """Classify error into known BYOK error statuses using structured data when possible."""
        status_code = None
        
        if hasattr(error, "code"):
            status_code = error.code
        elif hasattr(error, "status_code"):
            status_code = error.status_code
            
        error_str = str(error).lower()

        if status_code == 429 or any(t in error_str for t in ["429", "resource_exhausted", "rate_limit", "rate limit", "quota"]):
            return "user_ai_quota_exceeded"
            
        if status_code in [401, 403, 400] or any(t in error_str for t in ["401", "403", "unauthorized", "unauthenticated", "forbidden", "permission_denied", "api key not valid"]):
            return "user_ai_key_invalid"
            
        if status_code in [502, 503, 504] or any(t in error_str for t in ["502", "503", "504", "service unavailable", "bad gateway", "gateway timeout", "overloaded"]):
            return "gemini_temporarily_unavailable"
            
        return None

    def _raise_byok_error(self, classification: str | None):
        from fastapi import HTTPException
        if classification == "user_ai_quota_exceeded":
            raise HTTPException(status_code=429, detail={
                "status": "user_ai_quota_exceeded",
                "action": "replace_or_wait",
                "message": "Your Gemini API key has reached its quota or rate limit. Please wait, check your Google AI Studio quota, or add another Gemini API key.",
                "provider": "gemini",
                "credential_source": "user_gemini"
            })
        elif classification == "user_ai_key_invalid":
            raise HTTPException(status_code=403, detail={
                "status": "user_ai_key_invalid",
                "action": "replace_key",
                "message": "Your Gemini API key is invalid or no longer has permission. Please replace it in AI Access Settings.",
                "provider": "gemini",
                "credential_source": "user_gemini"
            })
        elif classification == "gemini_temporarily_unavailable":
            raise HTTPException(status_code=503, detail={
                "status": "gemini_temporarily_unavailable",
                "action": "retry_later",
                "message": "Gemini is temporarily unavailable or experiencing high demand. Please try again shortly.",
                "provider": "gemini",
                "credential_source": "user_gemini"
            })

    async def _execute_with_failover(self, method_name: str, *args, **kwargs) -> Any:
        """
        Core failover logic. Attempts the primary provider, fails over to the
        fallback provider if a retriable error occurs.
        """
        # Extract quota parameters
        db = kwargs.pop("db", None)
        user_id = kwargs.pop("user_id", None)
        feature_name = kwargs.pop("feature_name", None)

        if not db or not user_id or not feature_name:
            logger.warning(f"[AI_PROVIDER] Missing quota tracking info for {method_name}. Continuing without tracking.")

        from app.services.ai_usage_quota_service import reserve_usage, finalize_usage, AIQuotaExceededException
        from sqlalchemy.future import select
        from app.models.user_ai_provider_key import UserAiProviderKey
        from app.services.user_ai_key_encryption_service import encryption_service
        from app.services.ai.gemini_provider import GeminiProvider

        user_provider = None
        user_key_record = None

        if db and user_id:
            try:
                stmt = select(UserAiProviderKey).where(
                    UserAiProviderKey.user_id == user_id,
                    UserAiProviderKey.provider == "gemini",
                    UserAiProviderKey.is_active == True
                )
                result = await db.execute(stmt)
                user_key_record = result.scalar_one_or_none()

                if user_key_record:
                    plain_key = encryption_service.decrypt_key(user_key_record.encrypted_api_key)
                    user_provider = GeminiProvider(api_key=plain_key)
            except Exception as e:
                logger.error(f"[AI_PROVIDER] Failed to load/decrypt user key: {e}")

        providers = []
        if user_provider:
            providers.append(("user_gemini", user_provider))
            
        if settings.PLATFORM_AI_FALLBACK_ENABLED or not providers:
            # If fallback is enabled, or if we have no providers yet (but we might fail below if fallback is disabled)
            pass # We will check after if we have providers
            
        if settings.PLATFORM_AI_FALLBACK_ENABLED:
            providers.extend([
                (self.primary_name, self.primary),
                (self.fallback_name, self.fallback),
            ])

        if not providers:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=403, 
                detail={
                    "status": "ai_access_required",
                    "action": "connect_gemini_key",
                    "message": "Add your Gemini API key to use AI features."
                }
            )

        last_error = None
        user_error_classification = None
        usage_event_id = None
        current_provider_name = self.primary_name

        if db and user_id and feature_name:
            try:
                usage_event_id = await reserve_usage(
                    db=db,
                    user_id=user_id,
                    feature_name=feature_name,
                    provider=current_provider_name,
                    credential_source=f"platform_{current_provider_name}",
                    model_name="default"
                )
            except AIQuotaExceededException as e:
                # Automatically handled by global quota check, but we let it raise
                raise e
            except Exception as e:
                logger.error(f"[AI_PROVIDER] Failed to reserve quota: {e}")

        for provider_name, provider in providers:
            start_time = time.monotonic()
            try:
                method = getattr(provider, method_name)
                result, usage = await method(*args, **kwargs)
                elapsed_ms = round((time.monotonic() - start_time) * 1000, 1)

                logger.info(
                    f"[AI_PROVIDER] {provider_name} Success | "
                    f"method={method_name} | "
                    f"provider_used={provider_name} | "
                    f"response_time_ms={elapsed_ms}"
                )

                if usage_event_id:
                    status = "success" if provider_name == self.primary_name else "fallback_success"
                    if provider_name == "user_gemini":
                        status = "user_key_success"
                        
                    try:
                        await finalize_usage(
                            db=db,
                            usage_event_id=usage_event_id,
                            status=status,
                            input_tokens=usage.get("input_tokens"),
                            output_tokens=usage.get("output_tokens"),
                            total_tokens=usage.get("total_tokens"),
                            latency_ms=elapsed_ms
                        )
                    except Exception as e:
                        logger.error(f"[AI_PROVIDER] Failed to finalize usage: {e}")
                        
                # Update last used
                if provider_name == "user_gemini" and user_key_record and db:
                    from datetime import datetime, timezone
                    try:
                        user_key_record.last_used_at = datetime.now(timezone.utc)
                        await db.commit()
                    except Exception:
                        pass

                return result

            except Exception as e:
                elapsed_ms = round((time.monotonic() - start_time) * 1000, 1)
                last_error = e
                error_class = self._classify_error(e)

                if provider_name == "user_gemini":
                    user_error_classification = error_class

                if not self._is_failover_eligible(e):
                    # Non-retriable error — propagate immediately
                    logger.error(
                        f"[AI_PROVIDER] {provider_name} Non-Retriable Error | "
                        f"method={method_name} | "
                        f"provider_used={provider_name} | "
                        f"response_time_ms={elapsed_ms} | "
                        f"error={str(e)[:200]}"
                    )
                    
                    if provider_name == "user_gemini" and user_key_record and db:
                        err_str = str(e).lower()
                        if any(t in err_str for t in ["401", "403", "unauthorized", "forbidden", "api_key", "invalid"]):
                            try:
                                user_key_record.last_error = f"Key failed during usage: {str(e)[:100]}"
                                user_key_record.is_active = False
                                await db.commit()
                            except Exception as update_err:
                                logger.error(f"Failed to update user key error state: {update_err}")

                    if usage_event_id:
                        status = "failed" if provider_name == self.primary_name else "fallback_failed"
                        if provider_name == "user_gemini":
                            status = "user_key_failed"
                        try:
                            await finalize_usage(
                                db=db,
                                usage_event_id=usage_event_id,
                                status=status,
                                latency_ms=elapsed_ms,
                                error_code=type(e).__name__
                            )
                        except Exception as finalize_error:
                            logger.error(f"[AI_PROVIDER] Failed to finalize usage on non-retriable error: {finalize_error}")
                    
                    # If the user key already failed with a classified error,
                    # surface that instead of the raw platform error
                    if user_error_classification:
                        self._raise_byok_error(user_error_classification)
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

                if provider_name == self.fallback_name or not settings.PLATFORM_AI_FALLBACK_ENABLED:
                    # Both providers failed or fallback disabled
                    logger.error(
                        f"[AI_PROVIDER] All Providers Failed | "
                        f"method={method_name} | "
                        f"error={str(e)[:200]}"
                    )
                    if usage_event_id:
                        try:
                            await finalize_usage(
                                db=db,
                                usage_event_id=usage_event_id,
                                status="fallback_failed" if provider_name == self.fallback_name else "failed",
                                latency_ms=elapsed_ms,
                                error_code=type(e).__name__
                            )
                        except Exception as finalize_error:
                            logger.error(f"[AI_PROVIDER] Failed to finalize usage on total failure: {finalize_error}")
                    # If the user key already failed with a classified error,
                    # surface that instead of the raw provider error
                    if user_error_classification:
                        self._raise_byok_error(user_error_classification)
                    raise
                else:
                    logger.info(
                        f"[AI_PROVIDER] Switching To {self.fallback_name} | "
                        f"failover_trigger={type(e).__name__}"
                    )
                    continue

        # If we got here, all providers failed
        if user_error_classification:
            self._raise_byok_error(user_error_classification)

        if last_error:
            raise last_error
        raise RuntimeError("[AI_PROVIDER] No providers available")

    # ──────────────────────────────────────────────
    # AIProvider Interface Implementation
    # ──────────────────────────────────────────────

    async def analyze_clothing_image(
        self, image_data: bytes, mime_type: str, **kwargs
    ) -> AIClothingExtraction:
        return await self._execute_with_failover(
            "analyze_clothing_image", image_data, mime_type, **kwargs
        )

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
        **kwargs
    ) -> str:
        return await self._execute_with_failover(
            "generate_text",
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            timeout=timeout,
            **kwargs
        )

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str = "",
        temperature: float = 0.7,
        timeout: float = 5.0,
        **kwargs
    ) -> dict:
        return await self._execute_with_failover(
            "generate_json",
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            timeout=timeout,
            **kwargs
        )

    async def generate_chat_response(
        self,
        messages: list[dict[str, Any]],
        system_instruction: str = "",
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.4,
        timeout: float = 10.0,
        **kwargs
    ) -> dict[str, Any]:
        return await self._execute_with_failover(
            "generate_chat_response",
            messages=messages,
            system_instruction=system_instruction,
            tools=tools,
            temperature=temperature,
            timeout=timeout,
            **kwargs
        )

    async def generate_outfit_explanation(
        self,
        db: Any,
        user_id: Any,
        feature_name: str,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        occasion: str,
        weather: dict | None,
        scores: dict | None,
        style_dna: str | None = None,
        rotation_context: str | None = None,
        **kwargs
    ) -> str:
        return await self._execute_with_failover(
            "generate_outfit_explanation",
            db=db,
            user_id=user_id,
            feature_name=feature_name,
            top_name=top_name,
            bottom_name=bottom_name,
            footwear_name=footwear_name,
            occasion=occasion,
            weather=weather,
            scores=scores,
            style_dna=style_dna,
            rotation_context=rotation_context,
            **kwargs
        )

    async def generate_outfit_completion_accessories(
        self,
        db: Any,
        user_id: Any,
        feature_name: str,
        top_name: str,
        bottom_name: str,
        footwear_name: str,
        outerwear_name: str | None,
        anchor_type: str,
        styling_preference: str,
        **kwargs
    ) -> dict:
        return await self._execute_with_failover(
            "generate_outfit_completion_accessories",
            db=db,
            user_id=user_id,
            feature_name=feature_name,
            top_name=top_name,
            bottom_name=bottom_name,
            footwear_name=footwear_name,
            outerwear_name=outerwear_name,
            anchor_type=anchor_type,
            styling_preference=styling_preference,
            **kwargs
        )


# We need asyncio import for TimeoutError check
import asyncio  # noqa: E402

# Singleton instance — this is the global entry point for all AI operations
ai_provider = AIProviderRouter()
