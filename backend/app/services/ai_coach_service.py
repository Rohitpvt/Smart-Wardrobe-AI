"""
AI Coach Service.

Generates coaching insights using the AI Provider Router.
Fully provider-agnostic — previously called gemini_provider.client directly.
"""

import logging
from typing import Dict, Any

from app.services.ai import ai_provider

logger = logging.getLogger(__name__)


class AICoachService:
    async def generate_coaching_insight(self, context_dict: Dict[str, Any]) -> str:
        """
        Generates a 3-part coaching insight (Observation, Metric, Recommendation)
        using the AI provider router with automatic failover.
        """
        prompt = f"""
You are an expert AI Wardrobe Coach.
Based on the following user data, provide exactly ONE highly specific coaching insight.

USER CONTEXT:
{context_dict}

REQUIREMENTS:
You MUST format your response exactly like this, using these exact prefixes, with no extra text:

Observation:
[State a factual pattern you see in the data, e.g., "Your blue shirts account for only 8% of recent wears."]

Metric:
[Cite the specific data point or report, e.g., "Wardrobe utilization report."]

Recommendation:
[Give one actionable step, e.g., "Increase rotation of blue tops this week."]
"""
        try:
            return await ai_provider.generate_text(
                prompt=prompt,
                temperature=0.3,
                timeout=5.0,
            )
        except Exception as e:
            logger.error(f"Failed to generate coaching insight: {e}")
            return "Observation: Temporary service error.\nMetric: Service Availability.\nRecommendation: Try again later."


ai_coach_service = AICoachService()
