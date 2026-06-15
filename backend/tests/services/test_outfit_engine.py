import uuid
import pytest
from datetime import datetime, timedelta
from app.services.recommendations.engine import OutfitEngine, RecommendationError
from app.models.clothing_item import ClothingItem
from app.services.weather.provider import WeatherContext
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def engine():
    return OutfitEngine()

@pytest.fixture
def mock_session():
    mock = AsyncMock()
    return mock

def make_item(category: str, color: str, season: str) -> ClothingItem:
    return ClothingItem(
        id=uuid.uuid4(),
        category=category,
        color=color,
        season=season,
        name=f"Mock {color} {category}"
    )

@pytest.mark.asyncio
async def test_engine_strict_pass(engine, mock_session):
    top = make_item("TOPWEAR", "black", "WINTER")
    bottom = make_item("BOTTOMWEAR", "grey", "ALL_SEASON")
    shoes = make_item("FOOTWEAR", "white", "WINTER")
    
    def mock_execute(stmt):
        stmt_str = str(stmt).lower()
        mock_res = MagicMock()
        if "outfit_recommendations" in stmt_str:
            mock_res.scalars.return_value.all.return_value = []
        elif "id in" in stmt_str or "in_" in str(stmt): # Final query or if it checks id
            mock_res.scalars.return_value.all.return_value = [top, bottom, shoes]
        else:
            mock_res.all.return_value = [top, bottom, shoes]
            mock_res.scalars.return_value.all.return_value = [top, bottom, shoes]
        return mock_res
        
    mock_session.execute.side_effect = mock_execute
    
    weather = WeatherContext(weather_used=True, temperature_celsius=10.0, condition="Cold")
    
    res_top, res_bottom, res_shoes = await engine.generate_outfit(mock_session, uuid.uuid4(), "CASUAL", weather)
    assert res_top == top
    assert res_bottom == bottom
    assert res_shoes == shoes

@pytest.mark.asyncio
async def test_engine_insufficient_categories(engine, mock_session):
    top = make_item("TOPWEAR", "black", "WINTER")
    
    def mock_execute(stmt):
        mock_res = MagicMock()
        mock_res.all.return_value = [top]
        mock_res.scalars.return_value.all.return_value = [top]
        return mock_res
    mock_session.execute.side_effect = mock_execute
    weather = WeatherContext(weather_used=False)
    
    with pytest.raises(RecommendationError) as exc:
        await engine.generate_outfit(mock_session, uuid.uuid4(), "CASUAL", weather)
    
    assert exc.value.error_code == "INSUFFICIENT_BOTTOMWEAR"

@pytest.mark.asyncio
async def test_engine_pass2_season_fallback(engine, mock_session):
    # Temp > 25 requires SUMMER/ALL_SEASON, but we only have WINTER.
    top = make_item("TOPWEAR", "black", "WINTER")
    bottom = make_item("BOTTOMWEAR", "grey", "WINTER")
    shoes = make_item("FOOTWEAR", "white", "WINTER")
    
    def mock_execute(stmt):
        stmt_str = str(stmt).lower()
        mock_res = MagicMock()
        if "outfit_recommendations" in stmt_str:
            mock_res.scalars.return_value.all.return_value = []
        else:
            mock_res.all.return_value = [top, bottom, shoes]
            mock_res.scalars.return_value.all.return_value = [top, bottom, shoes]
        return mock_res
    mock_session.execute.side_effect = mock_execute
    
    weather = WeatherContext(weather_used=True, temperature_celsius=30.0, condition="Hot")
    
    # Should fallback to pass 2 and ignore season
    res_top, res_bottom, res_shoes = await engine.generate_outfit(mock_session, uuid.uuid4(), "CASUAL", weather)
    assert res_top == top

@pytest.mark.asyncio
async def test_engine_pass3_color_fallback(engine, mock_session):
    # Clashing colors (brown and grey clash in strict rules)
    top = make_item("TOPWEAR", "brown", "WINTER")
    bottom = make_item("BOTTOMWEAR", "grey", "WINTER")
    shoes = make_item("FOOTWEAR", "brown", "WINTER")
    
    def mock_execute(stmt):
        stmt_str = str(stmt).lower()
        mock_res = MagicMock()
        if "outfit_recommendations" in stmt_str:
            mock_res.scalars.return_value.all.return_value = []
        else:
            mock_res.all.return_value = [top, bottom, shoes]
            mock_res.scalars.return_value.all.return_value = [top, bottom, shoes]
        return mock_res
    mock_session.execute.side_effect = mock_execute
    weather = WeatherContext(weather_used=False)
    
    # Pass 3 relaxes color compatibility
    res_top, res_bottom, res_shoes = await engine.generate_outfit(mock_session, uuid.uuid4(), "CASUAL", weather)
    assert res_top == top

@pytest.mark.asyncio
async def test_engine_pass4_dedup_fallback(engine, mock_session):
    top = make_item("TOPWEAR", "black", "WINTER")
    bottom = make_item("BOTTOMWEAR", "grey", "WINTER")
    shoes = make_item("FOOTWEAR", "white", "WINTER")
    
    # History contains this exact triplet
    class MockRec:
        top_item_id = top.id
        bottom_item_id = bottom.id
        footwear_item_id = shoes.id
        
    def mock_execute(stmt):
        stmt_str = str(stmt).lower()
        mock_res = MagicMock()
        if "outfit_recommendations" in stmt_str:
            mock_res.scalars.return_value.all.return_value = [MockRec()]
        else:
            mock_res.all.return_value = [top, bottom, shoes]
            mock_res.scalars.return_value.all.return_value = [top, bottom, shoes]
        return mock_res
    mock_session.execute.side_effect = mock_execute
    weather = WeatherContext(weather_used=False)
    
    # Pass 4 overrides deduplication
    res_top, res_bottom, res_shoes = await engine.generate_outfit(mock_session, uuid.uuid4(), "CASUAL", weather)
    assert res_top == top
