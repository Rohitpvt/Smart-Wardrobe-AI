from typing import Optional
from app.core.config import settings

def calculate_cost(provider: str, input_tokens: Optional[int], output_tokens: Optional[int]) -> Optional[float]:
    """
    Safely calculates the estimated cost of an AI request based on token usage and configured prices.
    Returns None if:
    - Token counts are missing (None)
    - Provider is unknown
    - Pricing for the provider is not configured in environment variables
    """
    if input_tokens is None or output_tokens is None:
        return None

    provider = provider.lower()
    
    input_price: Optional[float] = None
    output_price: Optional[float] = None

    if provider == "gemini":
        input_price = settings.AI_COST_GEMINI_INPUT_PER_1M_TOKENS
        output_price = settings.AI_COST_GEMINI_OUTPUT_PER_1M_TOKENS
    elif provider == "nvidia":
        input_price = settings.AI_COST_NVIDIA_INPUT_PER_1M_TOKENS
        output_price = settings.AI_COST_NVIDIA_OUTPUT_PER_1M_TOKENS
    else:
        return None

    # If any required pricing config is missing, we return None (don't fake cost values)
    if input_price is None or output_price is None:
        return None

    # Formula: (input_tokens / 1_000_000 * input_price) + (output_tokens / 1_000_000 * output_price)
    cost = (input_tokens / 1_000_000 * input_price) + (output_tokens / 1_000_000 * output_price)
    return float(cost)
