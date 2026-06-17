from typing import Dict, Any, List

class RecommendationReasoningEngine:
    """
    Generates deterministic, human-readable reasoning based on intelligence signals.
    """

    def generate_reasoning(
        self,
        style_dna: Dict[str, Any],
        usage_intelligence: Dict[str, Any],
        seasonal_readiness: Dict[str, Any],
        confidence_score: int,
        style_alignment: int,
        weather_compatibility: int,
        rotation_benefit: int
    ) -> Dict[str, Any]:
        
        dominant_style = style_dna.get("dominant_style", "preferred")
        
        # 1. Primary Reason (Max 1 sentence)
        if style_alignment >= 80:
            primary_reason = f"This outfit closely matches your preferred {dominant_style} style."
        elif weather_compatibility >= 80:
            primary_reason = "This outfit is optimally suited for today's weather conditions."
        elif rotation_benefit >= 80:
            primary_reason = "This combination utilizes great pieces that haven't been worn recently."
        else:
            primary_reason = "This is a versatile combination built from your core wardrobe."

        # 2. Supporting Reasons (Max 4 items)
        supporting_reasons = []
        if style_alignment >= 70:
            supporting_reasons.append("Aligns well with your color affinities")
        if weather_compatibility >= 70:
            season = seasonal_readiness.get("season", "current season")
            supporting_reasons.append(f"Provides excellent {season} readiness")
        if rotation_benefit >= 60:
            supporting_reasons.append("Improves overall wardrobe rotation")
        if confidence_score >= 85:
            supporting_reasons.append("High historical success probability for similar combinations")

        # Fallback if too few
        if len(supporting_reasons) < 2:
            supporting_reasons.append("Uses balanced proportions and compatible colors")

        # Limit to 4
        supporting_reasons = supporting_reasons[:4]

        # 3. Improvement Suggestions (Max 3 items)
        improvement_suggestions = []
        if weather_compatibility < 60:
            improvement_suggestions.append("Consider adding a weather-appropriate outer layer")
        if style_alignment < 60:
            improvement_suggestions.append("Try swapping the footwear to better match your dominant style")
        if rotation_benefit < 40:
            improvement_suggestions.append("You wear these items frequently; consider rotating in neglected pieces")

        if not improvement_suggestions and confidence_score < 80:
            improvement_suggestions.append("Add a statement accessory to elevate the look")

        # Limit to 3
        improvement_suggestions = improvement_suggestions[:3]

        return {
            "primary_reason": primary_reason,
            "supporting_reasons": supporting_reasons,
            "improvement_suggestions": improvement_suggestions
        }

recommendation_reasoning_engine = RecommendationReasoningEngine()
