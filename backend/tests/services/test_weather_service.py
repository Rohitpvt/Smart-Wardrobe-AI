import pytest
from httpx import Response
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.weather.provider import OpenWeatherService, WeatherContext, weather_cache

@pytest.fixture
def service():
    weather_cache.clear()
    svc = OpenWeatherService()
    svc.api_key = "fake_key"
    return svc

@pytest.mark.asyncio
async def test_weather_cache_hit(service):
    weather_cache["testcity:us"] = WeatherContext(
        temperature_celsius=20.0,
        condition="Clear",
        city="TestCity",
        weather_used=True
    )
    
    with patch("httpx.AsyncClient.get") as mock_get:
        res = await service.get_current_weather("TestCity", "US")
        assert res.weather_used is True
        assert res.temperature_celsius == 20.0
        mock_get.assert_not_called()

@pytest.mark.asyncio
async def test_weather_cache_miss_api_success(service):
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"main": {"temp": 15.5}, "weather": [{"main": "Clouds"}], "name": "London"}
        )
        res = await service.get_current_weather("London", "UK")
        
        assert res.weather_used is True
        assert res.temperature_celsius == 15.5
        assert res.condition == "Clouds"
        assert res.city == "London"

@pytest.mark.asyncio
async def test_weather_api_failure_fallback(service):
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.side_effect = Exception("API Timeout")
        
        res = await service.get_current_weather("London", "UK")
        
        assert res.weather_used is False
        assert res.temperature_celsius is None
