from typing import Dict, Any, Tuple

class RecommendationConfidenceEngine:
    """
    Calculates a 0-100 confidence score based on intelligence signals.
    """
    # Configurable weights (must sum to 1.0)
    WEIGHT_STYLE_ALIGNMENT = 0.30
    WEIGHT_OUTFIT_SUCCESS = 0.25
    WEIGHT_PREFERENCE_MATCH = 0.20
    WEIGHT_WEATHER_COMPATIBILITY = 0.15
    WEIGHT_ROTATION_BENEFIT = 0.10

    def calculate_confidence(
        self,
        style_alignment: int,
        outfit_success_prediction: int,
        preference_match: int,
        weather_compatibility: int,
        rotation_benefit: int
    ) -> Tuple[int, str]:
        """
        Returns a tuple of (numeric_score, label)
        """
        score = (
            (style_alignment * self.WEIGHT_STYLE_ALIGNMENT) +
            (outfit_success_prediction * self.WEIGHT_OUTFIT_SUCCESS) +
            (preference_match * self.WEIGHT_PREFERENCE_MATCH) +
            (weather_compatibility * self.WEIGHT_WEATHER_COMPATIBILITY) +
            (rotation_benefit * self.WEIGHT_ROTATION_BENEFIT)
        )
        
        confidence_score = int(min(100, max(0, score)))
        
        if confidence_score >= 90:
            label = "Exceptional Recommendation"
        elif confidence_score >= 75:
            label = "Strong Recommendation"
        elif confidence_score >= 60:
            label = "Good Recommendation"
        else:
            label = "Experimental Recommendation"
            
        return confidence_score, label

recommendation_confidence_engine = RecommendationConfidenceEngine()
