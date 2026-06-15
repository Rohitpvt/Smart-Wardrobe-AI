from typing import Dict, Any

from app.models.clothing_item import ClothingItem
from app.services.weather.provider import WeatherContext

class OutfitScoringEngine:
    """
    Calculates detailed scores for an outfit recommendation based on context.
    """
    
    def score_outfit(
        self,
        top: ClothingItem | None,
        bottom: ClothingItem | None,
        footwear: ClothingItem | None,
        occasion: str,
        weather: WeatherContext
    ) -> Dict[str, Any]:
        """
        Generate comprehensive scores for an outfit combination.
        Returns a dict of scores (0-100) and metadata.
        """
        items = [i for i in [top, bottom, footwear] if i is not None]
        if not items:
            return self._default_scores()

        color_score = self._calculate_color_harmony(items)
        weather_score = self._calculate_weather_suitability(items, weather)
        occasion_score = self._calculate_occasion_match(items, occasion)
        season_score = self._calculate_season_match(items, weather)
        utilization_score = self._calculate_utilization(items)
        
        # Overall score is a weighted average
        weights = {
            "color": 0.20,
            "weather": 0.25,
            "occasion": 0.25,
            "season": 0.15,
            "utilization": 0.15
        }
        
        overall = int(
            (color_score * weights["color"]) +
            (weather_score * weights["weather"]) +
            (occasion_score * weights["occasion"]) +
            (season_score * weights["season"]) +
            (utilization_score * weights["utilization"])
        )
        
        return {
            "overall_score": overall,
            "color_score": color_score,
            "weather_score": weather_score,
            "occasion_score": occasion_score,
            "season_score": season_score,
            "utilization_score": utilization_score,
            "score_metadata": {
                "algorithm_version": "v1.0",
                "rules_applied": len(items) * 3
            }
        }

    def _default_scores(self) -> Dict[str, Any]:
        return {
            "overall_score": 0,
            "color_score": 0,
            "weather_score": 0,
            "occasion_score": 0,
            "season_score": 0,
            "utilization_score": 0,
            "score_metadata": {}
        }

    def _calculate_color_harmony(self, items: list[ClothingItem]) -> int:
        # Simple heuristic: identical colors might clash or be monochrome (80)
        # Distinct, recognizable colors are common (90+)
        colors = [i.color.lower() for i in items if i.color]
        unique_colors = set(colors)
        
        if len(unique_colors) == 1:
            return 85 # Monochrome
        elif len(unique_colors) == 2:
            return 95 # Classic duo
        elif len(unique_colors) == 3:
            return 90 # Triple threat
        else:
            return 75 # A bit busy

    def _calculate_weather_suitability(self, items: list[ClothingItem], weather: WeatherContext) -> int:
        if not weather.weather_used or weather.temperature_celsius is None:
            return 85 # Neutral if no weather data
            
        temp = weather.temperature_celsius
        score = 100
        
        has_heavy = any(i.clothing_type.lower() in ["sweater", "jacket", "coat"] for i in items)
        has_shorts = any(i.clothing_type.lower() in ["shorts", "skirt"] for i in items)
        
        # Temperature penalization
        if temp < 10 and not has_heavy:
            score -= 30
        if temp < 5 and has_shorts:
            score -= 40
        if temp > 25 and has_heavy:
            score -= 40
            
        # Wind/Rain penalization
        if weather.wind_speed and weather.wind_speed > 20 and has_shorts:
            score -= 10
        if weather.rain_probability and weather.rain_probability > 50:
            # Need something waterproof, but we don't track that natively yet. Just a slight hit if high rain.
            pass
            
        return max(0, min(100, score))

    def _calculate_occasion_match(self, items: list[ClothingItem], occasion: str) -> int:
        score = 100
        occ = occasion.upper()
        categories = [i.category.lower() for i in items]
        
        if occ == "FORMAL":
            if any("casual" in c for c in categories):
                score -= 30
        elif occ == "CASUAL":
            if any("formal" in c for c in categories):
                score -= 20
                
        return max(0, min(100, score))

    def _calculate_season_match(self, items: list[ClothingItem], weather: WeatherContext) -> int:
        # Match item's declared season with current implicit season
        if not weather.weather_used or weather.temperature_celsius is None:
            return 80
            
        temp = weather.temperature_celsius
        current_season = "Winter" if temp < 10 else "Spring/Fall" if temp < 20 else "Summer"
        
        match_count = 0
        total = 0
        for i in items:
            if i.season:
                total += 1
                s = i.season.lower()
                if "summer" in s and current_season == "Summer":
                    match_count += 1
                elif "winter" in s and current_season == "Winter":
                    match_count += 1
                elif ("spring" in s or "fall" in s or "autumn" in s) and current_season == "Spring/Fall":
                    match_count += 1
                elif "all" in s:
                    match_count += 1
        
        if total == 0:
            return 85
            
        return int((match_count / total) * 100)

    def _calculate_utilization(self, items: list[ClothingItem]) -> int:
        # Items worn less frequently yield higher utilization scores (encouraging rotation)
        wears = [i.worn_count for i in items]
        avg_wears = sum(wears) / len(wears) if wears else 0
        
        # If worn a lot (e.g. > 10), utilization score drops slightly because it's overused.
        # If rarely worn (e.g. 0-2), score is high (95-100).
        if avg_wears < 2:
            return 98
        elif avg_wears < 5:
            return 90
        elif avg_wears < 10:
            return 80
        else:
            return 70

outfit_scoring_engine = OutfitScoringEngine()
