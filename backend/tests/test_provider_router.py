"""
Unit tests for AIProviderRouter failover logic.

Tests:
  1. Primary provider success path
  2. Primary quota exhaustion → fallback success
  3. Primary timeout → fallback success
  4. Non-retriable error → no failover (propagated)
  5. Both providers fail → clean error
  6. Response schema parity
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.ai.ai_provider_router import AIProviderRouter, FAILOVER_TRIGGERS, NON_FAILOVER_TRIGGERS


# ──────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────

class MockProvider:
    """A mock AIProvider for testing."""

    def __init__(self):
        self.generate_text = AsyncMock()
        self.generate_json = AsyncMock()
        self.generate_chat_response = AsyncMock()
        self.analyze_clothing_image = AsyncMock()
        self.generate_outfit_explanation = AsyncMock()
        self.generate_outfit_completion_accessories = AsyncMock()


@pytest.fixture
def router_with_mocks():
    """Create an AIProviderRouter with mock primary and fallback providers."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    router.primary_name = "gemini"
    router.fallback_name = "nvidia"
    router.primary = MockProvider()
    router.fallback = MockProvider()
    router._providers = {"gemini": router.primary, "nvidia": router.fallback}
    return router


# ──────────────────────────────────────────────
# Test: Primary Provider Success Path
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_primary_success_path(router_with_mocks):
    """When primary succeeds, fallback should NOT be called."""
    router = router_with_mocks
    router.primary.generate_text.return_value = "Primary response"

    result = await router.generate_text(prompt="Hello")

    assert result == "Primary response"
    router.primary.generate_text.assert_called_once()
    router.fallback.generate_text.assert_not_called()


@pytest.mark.asyncio
async def test_primary_success_json(router_with_mocks):
    """JSON generation should succeed via primary."""
    router = router_with_mocks
    expected = {"reasoning": "test", "accessories": {"Watch": "Silver"}}
    router.primary.generate_json.return_value = expected

    result = await router.generate_json(prompt="Generate accessories")

    assert result == expected
    router.primary.generate_json.assert_called_once()
    router.fallback.generate_json.assert_not_called()


# ──────────────────────────────────────────────
# Test: Gemini Quota Exhausted → NVIDIA Fallback
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_gemini_quota_exhausted_triggers_nvidia_fallback(router_with_mocks):
    """429 RESOURCE_EXHAUSTED from Gemini should trigger NVIDIA fallback."""
    router = router_with_mocks

    # Gemini raises quota error
    router.primary.generate_text.side_effect = Exception(
        "429 RESOURCE_EXHAUSTED: You exceeded your current quota"
    )
    # NVIDIA succeeds
    router.fallback.generate_text.return_value = "NVIDIA response"

    result = await router.generate_text(prompt="Hello")

    assert result == "NVIDIA response"
    router.primary.generate_text.assert_called_once()
    router.fallback.generate_text.assert_called_once()


@pytest.mark.asyncio
async def test_gemini_rate_limit_triggers_nvidia_fallback(router_with_mocks):
    """Rate limit error should trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception(
        "429 rate limit exceeded for model"
    )
    router.fallback.generate_text.return_value = "NVIDIA fallback"

    result = await router.generate_text(prompt="Test")

    assert result == "NVIDIA fallback"
    router.fallback.generate_text.assert_called_once()


@pytest.mark.asyncio
async def test_gemini_server_error_500_triggers_fallback(router_with_mocks):
    """HTTP 500 from primary should trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("500 Internal Server Error")
    router.fallback.generate_text.return_value = "Fallback success"

    result = await router.generate_text(prompt="Test")

    assert result == "Fallback success"


@pytest.mark.asyncio
async def test_gemini_502_bad_gateway_triggers_fallback(router_with_mocks):
    """HTTP 502 from primary should trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("502 Bad Gateway")
    router.fallback.generate_text.return_value = "Fallback success"

    result = await router.generate_text(prompt="Test")

    assert result == "Fallback success"


@pytest.mark.asyncio
async def test_gemini_503_service_unavailable_triggers_fallback(router_with_mocks):
    """HTTP 503 from primary should trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("503 Service Unavailable")
    router.fallback.generate_text.return_value = "Fallback success"

    result = await router.generate_text(prompt="Test")

    assert result == "Fallback success"


@pytest.mark.asyncio
async def test_gemini_504_gateway_timeout_triggers_fallback(router_with_mocks):
    """HTTP 504 from primary should trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("504 Gateway Timeout")
    router.fallback.generate_text.return_value = "Fallback success"

    result = await router.generate_text(prompt="Test")

    assert result == "Fallback success"


# ──────────────────────────────────────────────
# Test: Timeout → Fallback
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_gemini_timeout_triggers_nvidia_fallback(router_with_mocks):
    """TimeoutError from Gemini should trigger NVIDIA fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = asyncio.TimeoutError()
    router.fallback.generate_text.return_value = "NVIDIA timeout fallback"

    result = await router.generate_text(prompt="Hello")

    assert result == "NVIDIA timeout fallback"
    router.primary.generate_text.assert_called_once()
    router.fallback.generate_text.assert_called_once()


# ──────────────────────────────────────────────
# Test: Non-Retriable Errors → NO Failover
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_invalid_argument_no_failover(router_with_mocks):
    """400 INVALID_ARGUMENT should NOT trigger fallback — error propagated."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception(
        "400 INVALID_ARGUMENT: The prompt is malformed"
    )

    with pytest.raises(Exception, match="INVALID_ARGUMENT"):
        await router.generate_text(prompt="Bad prompt")

    router.fallback.generate_text.assert_not_called()


@pytest.mark.asyncio
async def test_unauthorized_no_failover(router_with_mocks):
    """401 UNAUTHORIZED should NOT trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("401 Unauthorized")

    with pytest.raises(Exception, match="Unauthorized"):
        await router.generate_text(prompt="Test")

    router.fallback.generate_text.assert_not_called()


@pytest.mark.asyncio
async def test_forbidden_no_failover(router_with_mocks):
    """403 FORBIDDEN should NOT trigger fallback."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("403 Forbidden")

    with pytest.raises(Exception, match="Forbidden"):
        await router.generate_text(prompt="Test")

    router.fallback.generate_text.assert_not_called()


# ──────────────────────────────────────────────
# Test: Both Providers Fail → Clean Error
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_both_providers_fail_raises_error(router_with_mocks):
    """When both providers fail with retriable errors, the last error is raised."""
    router = router_with_mocks

    router.primary.generate_text.side_effect = Exception("429 RESOURCE_EXHAUSTED")
    router.fallback.generate_text.side_effect = Exception("503 Service Unavailable")

    with pytest.raises(Exception, match="Service Unavailable"):
        await router.generate_text(prompt="Test")


# ──────────────────────────────────────────────
# Test: Response Schema Parity
# ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_chat_response_schema_parity(router_with_mocks):
    """Chat response should have normalized schema regardless of provider."""
    router = router_with_mocks

    expected = {
        "text": "I recommend a blue shirt.",
        "function_calls": [{"name": "generate_outfit", "args": {"occasion": "CASUAL"}}],
    }
    router.primary.generate_chat_response.return_value = expected

    result = await router.generate_chat_response(
        messages=[{"role": "user", "content": "What should I wear?"}]
    )

    assert "text" in result
    assert "function_calls" in result
    assert result["function_calls"][0]["name"] == "generate_outfit"


@pytest.mark.asyncio
async def test_outfit_explanation_via_fallback(router_with_mocks):
    """Outfit explanation should work via fallback after primary failure."""
    router = router_with_mocks

    router.primary.generate_outfit_explanation.side_effect = Exception("429 RESOURCE_EXHAUSTED")
    router.fallback.generate_outfit_explanation.return_value = "A great casual look combining comfort and style."

    result = await router.generate_outfit_explanation(
        top_name="Blue Shirt",
        bottom_name="Black Jeans",
        footwear_name="White Sneakers",
        occasion="CASUAL",
        weather=None,
        scores=None,
    )

    assert "casual" in result.lower() or "comfort" in result.lower() or "style" in result.lower()
    router.fallback.generate_outfit_explanation.assert_called_once()


@pytest.mark.asyncio
async def test_accessories_via_fallback(router_with_mocks):
    """Accessories generation should work via fallback after primary failure."""
    router = router_with_mocks

    router.primary.generate_outfit_completion_accessories.side_effect = Exception("429 quota exceeded")
    router.fallback.generate_outfit_completion_accessories.return_value = {
        "reasoning": "NVIDIA generated reasoning.",
        "accessories": {"Belt": "Brown Leather"},
    }

    result = await router.generate_outfit_completion_accessories(
        top_name="Blue Shirt",
        bottom_name="Black Jeans",
        footwear_name="White Sneakers",
        outerwear_name=None,
        anchor_type="TOPWEAR",
        styling_preference="masculine",
    )

    assert "reasoning" in result
    assert "accessories" in result
    assert result["accessories"]["Belt"] == "Brown Leather"


# ──────────────────────────────────────────────
# Test: Failover Eligibility Logic
# ──────────────────────────────────────────────

def test_failover_eligibility_429():
    """429 errors should be failover eligible."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    assert router._is_failover_eligible(Exception("429 RESOURCE_EXHAUSTED")) is True


def test_failover_eligibility_timeout():
    """TimeoutError should be failover eligible."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    assert router._is_failover_eligible(asyncio.TimeoutError()) is True


def test_no_failover_on_400():
    """400 errors should NOT be failover eligible."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    assert router._is_failover_eligible(Exception("400 INVALID_ARGUMENT")) is False


def test_no_failover_on_401():
    """401 errors should NOT be failover eligible."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    assert router._is_failover_eligible(Exception("401 Unauthorized")) is False


def test_no_failover_on_403():
    """403 errors should NOT be failover eligible."""
    router = AIProviderRouter.__new__(AIProviderRouter)
    assert router._is_failover_eligible(Exception("403 Forbidden")) is False
