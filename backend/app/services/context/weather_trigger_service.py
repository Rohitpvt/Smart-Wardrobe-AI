from typing import Dict, Any, Optional

class WeatherTriggerService:
    """
    Detects weather triggers and evaluates severity.
    """
    
    def evaluate_weather(self, weather_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Analyzes current or forecasted weather for notable triggers.
        Returns a dictionary with severity, trigger_type, and message if a trigger is detected.
        Severities: 'low', 'medium', 'high', 'critical'
        """
        # In a real implementation, this would parse real weather API data.
        # We will use mock heuristics for demonstration.
        
        temp_c = weather_data.get("temperature", 20)
        condition = weather_data.get("condition", "clear").lower()
        uv_index = weather_data.get("uv_index", 5)
        
        if temp_c >= 40:
            return {
                "trigger_type": "extreme_heat",
                "severity": "critical",
                "message": "Extreme heatwave detected. Prioritize breathable fabrics and UV protection."
            }
        elif temp_c >= 32:
            return {
                "trigger_type": "heat",
                "severity": "high",
                "message": "High temperatures expected today. Lightweight clothing recommended."
            }
            
        if temp_c <= 0:
            return {
                "trigger_type": "extreme_cold",
                "severity": "critical",
                "message": "Freezing conditions. Heavy layering and thermal insulation required."
            }
        elif temp_c <= 10:
            return {
                "trigger_type": "cold",
                "severity": "medium",
                "message": "Chilly weather expected. Consider a jacket or sweater."
            }
            
        if "rain" in condition or "storm" in condition:
            return {
                "trigger_type": "rain",
                "severity": "high",
                "message": "Rain is highly probable today. Water-resistant outerwear is advised."
            }
            
        if uv_index >= 8:
            return {
                "trigger_type": "high_uv",
                "severity": "medium",
                "message": "High UV Index today. Consider wearing hats and protective layers."
            }
            
        return None

    def map_severity_to_confidence_boost(self, severity: str) -> float:
        """
        Critical and High severity weather events carry higher inherent signal strength.
        """
        mapping = {
            "critical": 1.0,
            "high": 0.8,
            "medium": 0.5,
            "low": 0.3
        }
        return mapping.get(severity, 0.3)

weather_trigger_service = WeatherTriggerService()
