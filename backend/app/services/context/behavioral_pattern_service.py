from typing import Dict, Any, List
from app.services.context.confidence_engine import confidence_engine

class BehavioralPatternService:
    """
    Detects behavioral patterns from platform usage data.
    """
    
    def generate_behavioral_insights(self, usage_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generates insights based on usage frequency, feedback participation, etc.
        Guardrail: Only insights with confidence > 70 are returned.
        """
        insights = []
        
        # In a real implementation, usage_data would contain aggregated metrics
        # For demonstration, we'll mock a pattern if specific flags are present in usage_data
        
        # Example 1: High weekend usage
        if usage_data.get("weekend_generation_ratio", 0) > 0.8:
            # Calculate confidence
            # data_volume (e.g. number of total generations), recency, consistency, signal_strength
            vol = min(1.0, usage_data.get("total_generations", 0) / 50.0)
            conf = confidence_engine.calculate_confidence(
                data_volume=vol,
                recency=0.9,
                consistency=0.85,
                signal_strength=0.8
            )
            
            if conf > 70:
                insights.append({
                    "type": "behavioral",
                    "confidence_score": conf,
                    "message": "You generate significantly more outfits on weekends. Consider planning your week's outfits on Sunday evening."
                })
                
        # Example 2: Feedback drop-off
        if usage_data.get("feedback_dropoff", False):
            vol = 0.5
            conf = confidence_engine.calculate_confidence(
                data_volume=vol,
                recency=0.9,
                consistency=0.6,
                signal_strength=0.7
            )
            
            if conf > 70:
                insights.append({
                    "type": "behavioral",
                    "confidence_score": conf,
                    "message": "You've been providing less outfit feedback lately. Rating outfits helps improve your personal stylist."
                })
                
        return insights

behavioral_pattern_service = BehavioralPatternService()
