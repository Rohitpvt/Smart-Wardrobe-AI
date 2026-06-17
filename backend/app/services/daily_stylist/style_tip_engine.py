from typing import Dict, Any

class StyleTipEngine:
    """
    Generates actionable, weather-aware, and outfit-specific styling tips.
    """

    def generate_style_tip(self, recommended_outfit: dict, weather_context: dict) -> str:
        # Provide outfit-specific and weather-aware tips
        temp = weather_context.get("temperature_celsius")
        
        top = recommended_outfit.get("top", {})
        bottom = recommended_outfit.get("bottom", {})
        shoes = recommended_outfit.get("shoes", {})
        outerwear = recommended_outfit.get("outerwear")

        # 1. Outerwear & Weather combinations
        if outerwear:
            if temp is not None and temp < 10:
                return f"Button up your {outerwear.get('name', 'jacket')} and consider adding a scarf for the cold."
            elif temp is not None and temp > 18:
                return f"Wear your {outerwear.get('name', 'jacket')} open over your {top.get('name', 'top')} for a relaxed layered look."
            else:
                return f"The {outerwear.get('name', 'jacket')} layers perfectly over the {top.get('name', 'top')} today."

        # 2. Temperature specific tips
        if temp is not None:
            if temp > 28:
                return f"With the heat today, consider rolling up the sleeves of your {top.get('name', 'top')} for better airflow."
            elif temp > 22:
                return f"The {top.get('name', 'top')} and {bottom.get('name', 'bottoms')} offer a great breathable combination for the warm weather."

        # 3. Item specific combinations
        top_name = top.get('name', '').lower()
        bottom_name = bottom.get('name', '').lower()
        
        if "shirt" in top_name and "jeans" in bottom_name:
            return f"Try a partial tuck with your {top.get('name')} to elevate the silhouette with these jeans."
        elif "sneaker" in shoes.get("name", "").lower():
            return "Keep the sneakers clean to maintain a sharp, intentional casual look."

        # Fallback
        return f"This combination of {top.get('name', 'your top')} and {bottom.get('name', 'your bottoms')} balances comfort and style perfectly."

style_tip_engine = StyleTipEngine()
