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
        
        dominant_style = style_dna.get("dominant_style", style_dna.get("style_type", "preferred"))
        feedback_insights = style_dna.get("feedback_insights", {})
        liked_styles = feedback_insights.get("liked_styles", [])
        liked_colors = feedback_insights.get("liked_colors", [])
        
        # 1. Primary Reason (Max 1 sentence)
        if dominant_style in liked_styles:
            primary_reason = f"You have consistently responded positively to similar {dominant_style} outfits, so this recommendation received a higher ranking."
        elif style_alignment >= 80:
            primary_reason = f"This outfit closely matches your preferred {dominant_style} style."
        elif weather_compatibility >= 80:
            primary_reason = "This outfit is optimally suited for today's weather conditions."
        elif rotation_benefit >= 80:
            primary_reason = "This combination utilizes great pieces that haven't been worn recently."
        else:
            primary_reason = "This is a versatile combination built from your core wardrobe."

        # 2. Supporting Reasons (Max 4 items)
        supporting_reasons = []
        if liked_colors and style_alignment >= 70:
            supporting_reasons.append(f"Features your preferred color affinities (like {liked_colors[0]})")
        elif style_alignment >= 70:
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
            
        profile_hints = style_dna.get("profile_hints", {})
        if profile_hints.get("primary_style") and profile_hints.get("primary_style").lower() != dominant_style.lower():
            improvement_suggestions.append(f"To better match your goal of {profile_hints.get('primary_style')} style, consider incorporating more statement pieces.")

        if profile_hints.get("fashion_experience") and profile_hints.get("fashion_experience").lower() == "beginner":
            improvement_suggestions.append("This is a safe, foundational outfit. Don't be afraid to experiment with layering.")

        # Limit to 3
        improvement_suggestions = improvement_suggestions[:3]

        return {
            "primary_reason": primary_reason,
            "supporting_reasons": supporting_reasons,
            "improvement_suggestions": improvement_suggestions
        }

recommendation_reasoning_engine = RecommendationReasoningEngine()
