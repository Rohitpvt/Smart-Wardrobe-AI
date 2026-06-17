from typing import Dict, Any

class HealthScoreExplainer:
    """
    Translates raw sub-scores into an actionable, user-facing summary and grade.
    """
    def __init__(self):
        self.subscore_names = {
            "utilization_health": "Utilization",
            "coverage_health": "Coverage",
            "style_alignment": "Style Alignment",
            "recommendation_effectiveness": "Recommendation Effectiveness",
            "financial_efficiency": "Financial Efficiency",
            "future_readiness": "Future Readiness"
        }
        
    def generate_explanation(self, scores: Dict[str, float]) -> Dict[str, Any]:
        overall = scores.get("overall_score", 0)
        grade = self._calculate_grade(overall)
        
        # Determine strongest and weakest
        subscores = {k: v for k, v in scores.items() if k != "overall_score"}
        if not subscores:
            return self._empty_explanation()
            
        strongest_key = max(subscores, key=subscores.get)
        weakest_key = min(subscores, key=subscores.get)
        
        projected_gain = min(100 - overall, round((100 - subscores[weakest_key]) * 0.2)) # Rough calculation 
        
        top_improvement = self._generate_improvement_action(weakest_key, subscores[weakest_key])
        
        return {
            "overall_score": overall,
            "grade": grade,
            "strongest_area": self.subscore_names.get(strongest_key, strongest_key),
            "weakest_area": self.subscore_names.get(weakest_key, weakest_key),
            "top_improvement": top_improvement,
            "projected_score_gain": max(1, int(projected_gain))
        }

    def _calculate_grade(self, score: float) -> str:
        if score >= 90: return "A+"
        if score >= 80: return "A"
        if score >= 70: return "B"
        if score >= 60: return "C"
        if score >= 50: return "D"
        return "F"
        
    def _generate_improvement_action(self, weakest_key: str, score: float) -> str:
        if weakest_key == "utilization_health":
            return "Wear some of your neglected items to balance rotation."
        elif weakest_key == "coverage_health":
            return "Fill essential wardrobe gaps to improve overall coverage."
        elif weakest_key == "style_alignment":
            return "Log more outfits so we can learn your true style preferences."
        elif weakest_key == "recommendation_effectiveness":
            return "Provide more feedback on recommendations to improve AI accuracy."
        elif weakest_key == "financial_efficiency":
            return "Increase the wear count of your expensive items to lower cost-per-wear."
        elif weakest_key == "future_readiness":
            return "Review your wardrobe gaps before the next season starts."
        return "Log more wear events to improve analytics."

    def _empty_explanation(self) -> Dict[str, Any]:
        return {
            "overall_score": 0,
            "grade": "N/A",
            "strongest_area": "None",
            "weakest_area": "Coverage",
            "top_improvement": "Add your first items to the wardrobe.",
            "projected_score_gain": 50
        }

health_score_explainer = HealthScoreExplainer()
