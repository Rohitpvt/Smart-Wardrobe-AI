import pytest
from httpx import AsyncClient
from app.core.config import settings
from tests.api.test_wardrobe import _register_and_login, _upload_item

@pytest.mark.asyncio
async def test_dashboard_unauthorized(client: AsyncClient):
    response = await client.get(f"{settings.API_PREFIX}/dashboard")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_dashboard_empty_wardrobe(client: AsyncClient):
    token = await _register_and_login(client)
    response = await client.get(
        f"{settings.API_PREFIX}/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 0
    assert data["categories"] == 0
    assert data["unique_colors"] == 0
    assert data["unique_brands"] == 0
    assert data["ai_generated_items"] == 0
    assert data["manual_items"] == 0
    assert data["average_ai_confidence"] == 0
    assert data["health_metrics"]["ai_coverage_percentage"] == 0
    assert data["health_metrics"]["metadata_completeness_percentage"] == 0
    assert data["health_metrics"]["imbalance_flag"] is False
    assert len(data["category_distribution"]) == 0
    assert len(data["recent_items"]) == 0

@pytest.mark.asyncio
async def test_dashboard_populated_wardrobe(client: AsyncClient, db):
    token = await _register_and_login(client)
    
    # Upload 3 items
    await _upload_item(client, token, name="Shirt 1", category="TOPWEAR", color="Blue")
    await _upload_item(client, token, name="Jeans 1", category="BOTTOMWEAR", color="Blue", brand="Levi's")
    await _upload_item(client, token, name="Sneakers 1", category="FOOTWEAR", color="White")
    
    # Let's mock AI generation flag and confidence in DB directly or test without it
    # Without AI mock, ai_generated_items is 0 and average_ai_confidence is 0.
    
    response = await client.get(
        f"{settings.API_PREFIX}/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 3
    assert data["categories"] == 3 # TOPWEAR, BOTTOMWEAR, FOOTWEAR
    assert data["unique_colors"] == 2 # Blue, White
    assert data["unique_brands"] == 1 # Levi's
    assert len(data["recent_items"]) == 3
    
    # Category Distribution check
    cat_dist = {d["name"]: d["count"] for d in data["category_distribution"]}
    assert cat_dist.get("TOPWEAR") == 1
    assert cat_dist.get("BOTTOMWEAR") == 1
    assert cat_dist.get("FOOTWEAR") == 1
    
    # Color Distribution check
    col_dist = {d["name"]: d["count"] for d in data["color_distribution"]}
    assert col_dist.get("Blue") == 2
    assert col_dist.get("White") == 1
    
    # Health metrics
    # 3 items * 4 fields = 12 total fields. 1 brand provided. 1/12 = 8% completeness.
    assert data["health_metrics"]["metadata_completeness_percentage"] == 8

@pytest.mark.asyncio
async def test_dashboard_user_isolation(client: AsyncClient):
    token1 = await _register_and_login(client)
    await _upload_item(client, token1, name="User1 Item", category="TOPWEAR", color="Red")
    
    token2 = await _register_and_login(client)
    response2 = await client.get(
        f"{settings.API_PREFIX}/dashboard",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["total_items"] == 0 # User2 shouldn't see User1's items

@pytest.mark.asyncio
async def test_dashboard_confidence_trend(client: AsyncClient):
    token = await _register_and_login(client)
    response = await client.get(
        f"{settings.API_PREFIX}/dashboard/confidence-trend?days=30",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
