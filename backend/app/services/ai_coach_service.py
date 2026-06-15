import logging
from typing import Dict, Any

from app.services.ai.gemini_provider import gemini_provider
from google.genai import types

logger = logging.getLogger(__name__)

class AICoachService:
    async def generate_coaching_insight(self, context_dict: Dict[str, Any]) -> str:
        """
        Generates a 3-part coaching insight (Observation, Metric, Recommendation)
        using the Gemini provider.
        """
        if not gemini_provider.client:
            return "Observation: API Key missing.\nMetric: System Check.\nRecommendation: Please configure GEMINI_API_KEY."

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
            import asyncio
            def _generate():
                return gemini_provider.client.models.generate_content(
                    model=gemini_provider.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.3),
                ).text
            
            insight = await asyncio.to_thread(_generate)
            return insight.strip() if insight else "No insight generated."
        except Exception as e:
            logger.error(f"Failed to generate coaching insight: {e}")
            return "Observation: Temporary service error.\nMetric: Service Availability.\nRecommendation: Try again later."

ai_coach_service = AICoachService()
