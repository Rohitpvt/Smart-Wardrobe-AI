import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import patch, MagicMock, AsyncMock

from app.core.config import settings
from app.models.clothing_item import ClothingItem
from app.services.recommendations.engine import outfit_engine, RecommendationError
from tests.api.test_wardrobe import _register_and_login

@pytest.fixture
async def setup_wardrobe(client: AsyncClient, test_db_session):
    # This requires access to db session. Since it's hard to get in a standard fixture without async_sessionmaker,
    # let's just do it directly inside the test.
    pass

@pytest.mark.asyncio
async def test_generate_recommendation_success(client: AsyncClient):
    token = await _register_and_login(client)
    
    # We need to create actual clothing items via the API first so they exist in DB
    import io
    from tests.api.test_wardrobe import _create_test_image
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Upload 3 items
    item_ids = []
    for cat in ["TOPWEAR", "BOTTOMWEAR", "FOOTWEAR"]:
        img = _create_test_image()
        data = {
            "name": f"Test {cat}", "clothing_type": "Type", "category": cat, "color": "Black",
            "ai_generated": "false"
        }
        res = await client.post(f"{settings.API_PREFIX}/wardrobe", headers=headers, data=data, files={"image": ("test.jpg", img, "image/jpeg")})
        assert res.status_code == 201
        item_ids.append(res.json()["id"])
        
    class MockItem:
        def __init__(self, item_id, cat):
            from datetime import datetime
            self.id = uuid.UUID(item_id)
            self.name = f"Test {cat}"
            self.category = cat
            self.clothing_type = "Type"
            self.color = "Black"
            self.ai_generated = False
            self.image_url = ""
            self.user_id = uuid.uuid4()
            self.season = None
            self.pattern = None
            self.material = None
            self.brand = None
            self.notes = None
            self.ai_confidence = 100
            self.created_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()
            
    mock_outfit = (MockItem(item_ids[0], "TOPWEAR"), MockItem(item_ids[1], "BOTTOMWEAR"), MockItem(item_ids[2], "FOOTWEAR"))

    with patch("app.api.endpoints.recommendations.outfit_engine.generate_outfit", new_callable=AsyncMock) as mock_engine:
        mock_engine.return_value = mock_outfit
        
        with patch("app.api.endpoints.recommendations.weather_service.get_current_weather", new_callable=AsyncMock) as mock_weather:
            from app.services.weather.provider import WeatherContext
            mock_weather.return_value = WeatherContext(weather_used=False)
            
            with patch("app.api.endpoints.recommendations.gemini_provider.generate_outfit_explanation", new_callable=AsyncMock) as mock_ai:
                mock_ai.return_value = "This is a mocked AI explanation."
                
                response = await client.post(
                    f"{settings.API_PREFIX}/recommendations/generate",
                    headers={"Authorization": f"Bearer {token}"},
                    json={"occasion": "CASUAL"}
                )
                
                assert response.status_code == 201
                data = response.json()
                assert data["success"] is True
                assert data["data"]["ai_explanation"] == "This is a mocked AI explanation."
                assert data["data"]["occasion"] == "CASUAL"

@pytest.mark.asyncio
async def test_generate_recommendation_insufficient_items(client: AsyncClient):
    token = await _register_and_login(client)
    
    with patch("app.api.endpoints.recommendations.outfit_engine.generate_outfit", new_callable=AsyncMock) as mock_engine:
        mock_engine.side_effect = RecommendationError("INSUFFICIENT_TOPWEAR", "Not enough topwear items.")
        
        with patch("app.api.endpoints.recommendations.weather_service.get_current_weather", new_callable=AsyncMock) as mock_weather:
            from app.services.weather.provider import WeatherContext
            mock_weather.return_value = WeatherContext(weather_used=False)
            
            response = await client.post(
                f"{settings.API_PREFIX}/recommendations/generate",
                headers={"Authorization": f"Bearer {token}"},
                json={"occasion": "CASUAL"}
            )
            
            assert response.status_code == 422
            data = response.json()
            assert data["detail"]["error_code"] == "INSUFFICIENT_TOPWEAR"

@pytest.mark.asyncio
async def test_get_recommendations(client: AsyncClient):
    token = await _register_and_login(client)
    response = await client.get(
        f"{settings.API_PREFIX}/recommendations?page=1&page_size=20",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "pagination" in data

@pytest.mark.asyncio
async def test_delete_recommendation_not_found(client: AsyncClient):
    token = await _register_and_login(client)
    fake_id = str(uuid.uuid4())
    response = await client.delete(
        f"{settings.API_PREFIX}/recommendations/{fake_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404
