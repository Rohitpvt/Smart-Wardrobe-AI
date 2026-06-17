from app.services.weather.provider import WeatherContext

class WeatherContextEngine:
    """
    Translates raw weather metrics into a daily style context.
    """

    def process_weather(self, weather: WeatherContext) -> dict:
        if not weather.weather_used or weather.temperature_celsius is None:
            return {
                "temperature": None,
                "condition": None,
                "suitability_score": 85,
                "notes": "Weather data unavailable. Generated a versatile indoor-appropriate look."
            }

        temp = weather.temperature_celsius
        condition = (weather.condition or "").lower()

        # Score how extreme the weather is to determine styling difficulty
        suitability_score = 100
        notes = []

        if temp < 5:
            suitability_score -= 15
            notes.append("Freezing temperatures require heavy layering.")
        elif temp < 15:
            suitability_score -= 5
            notes.append("Cool weather ideal for jackets or knitwear.")
        elif temp > 30:
            suitability_score -= 20
            notes.append("Extreme heat detected. Prioritizing highly breathable fabrics.")
        elif temp > 25:
            suitability_score -= 5
            notes.append("Warm day ahead. Kept layers minimal.")
        else:
            notes.append("Perfect, mild weather for versatile styling.")

        if "rain" in condition or weather.rain_probability and weather.rain_probability > 50:
            suitability_score -= 10
            notes.append("Rain expected. Darker colors and appropriate footwear recommended.")

        return {
            "temperature": temp,
            "condition": weather.condition,
            "suitability_score": max(0, min(100, suitability_score)),
            "notes": " ".join(notes)
        }

weather_context_engine = WeatherContextEngine()
