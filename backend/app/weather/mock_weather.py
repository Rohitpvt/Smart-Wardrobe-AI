"""
Mock Weather Provider.

Returns realistic, deterministic weather data without any external API calls.
Uses a simple location-based heuristic for variety.
"""

import hashlib
from typing import Optional

# ─── Mock weather profiles for different "hashes" ─────────────────────
MOCK_PROFILES = [
    {
        "temperature": 34,
        "condition": "Sunny",
        "humidity": 45,
        "season_hint": "Summer",
        "weather_key": "hot",
        "clothing_advice": "It's hot outside! Wear light, breathable fabrics like cotton or linen. Avoid dark, heavy clothing.",
    },
    {
        "temperature": 8,
        "condition": "Cloudy",
        "humidity": 72,
        "season_hint": "Winter",
        "weather_key": "cold",
        "clothing_advice": "Bundle up — it's cold! Layer with a hoodie or jacket and wear warm materials like wool or fleece.",
    },
    {
        "temperature": 26,
        "condition": "Rainy",
        "humidity": 88,
        "season_hint": "Monsoon",
        "weather_key": "rainy",
        "clothing_advice": "Rain expected! Wear quick-dry, dark-colored clothes. Avoid white shoes and suede/leather items.",
    },
    {
        "temperature": 22,
        "condition": "Partly Cloudy",
        "humidity": 60,
        "season_hint": "Spring",
        "weather_key": "mild",
        "clothing_advice": "Pleasant weather today. You can wear almost anything — great day for your favorite outfit!",
    },
    {
        "temperature": 30,
        "condition": "Hazy",
        "humidity": 82,
        "season_hint": "Summer",
        "weather_key": "humid",
        "clothing_advice": "Very humid today. Choose breathable cotton or linen in loose fits. Avoid heavy denim and synthetic fabrics.",
    },
]


def get_mock_weather(location: Optional[str] = None) -> dict:
    """
    Return deterministic mock weather data based on the location string.
    Different locations produce different weather profiles for realistic testing.
    """
    loc = (location or "Delhi").strip().lower()
    
    # Use a hash of the location to deterministically pick a profile
    hash_val = int(hashlib.md5(loc.encode()).hexdigest(), 16)
    profile = MOCK_PROFILES[hash_val % len(MOCK_PROFILES)]

    return {
        "location": location or "Delhi",
        "temperature": profile["temperature"],
        "condition": profile["condition"],
        "humidity": profile["humidity"],
        "season_hint": profile["season_hint"],
        "weather_key": profile["weather_key"],
        "clothing_advice": profile["clothing_advice"],
        "provider": "mock",
    }
