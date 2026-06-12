"""
Tests for Wardrobe API endpoints.

Covers CRUD operations, file validation, pagination, search, filter, sort, and ownership.
"""

import io
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from PIL import Image

from app.core.config import settings


def _create_test_image(format: str = "JPEG", width: int = 100, height: int = 100) -> io.BytesIO:
    """Create a minimal test image in memory."""
    img = Image.new("RGB", (width, height), color="red")
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    buffer.seek(0)
    return buffer


async def _register_and_login(client: AsyncClient, email: str | None = None) -> str:
    """Helper: register a user and return an access token."""
    email = email or f"wardrobe_{uuid.uuid4().hex}@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "W", "last_name": "T"},
    )
    login = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "securepassword123"},
    )
    return login.json()["access_token"]


async def _upload_item(client: AsyncClient, token: str, name: str = "Test Shirt", **kwargs) -> dict:
    """Helper: upload a clothing item and return the response data."""
    img = _create_test_image()
    form_data = {
        "name": name,
        "clothing_type": kwargs.get("clothing_type", "T-Shirt"),
        "category": kwargs.get("category", "TOPWEAR"),
        "color": kwargs.get("color", "Black"),
    }
    for field in ("pattern", "material", "season", "brand", "notes"):
        if field in kwargs:
            form_data[field] = kwargs[field]

    response = await client.post(
        f"{settings.API_PREFIX}/wardrobe",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.jpg", img, "image/jpeg")},
        data=form_data,
    )
    return response


# === Registration / Upload Tests ===

@pytest.mark.asyncio
async def test_upload_valid_image(client: AsyncClient):
    token = await _register_and_login(client)
    response = await _upload_item(client, token)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Shirt"
    assert data["category"] == "TOPWEAR"
    assert "id" in data
    assert "image_url" in data


@pytest.mark.asyncio
async def test_upload_invalid_mime_type(client: AsyncClient):
    token = await _register_and_login(client)
    fake_file = io.BytesIO(b"<svg></svg>")
    response = await client.post(
        f"{settings.API_PREFIX}/wardrobe",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.svg", fake_file, "image/svg+xml")},
        data={"name": "Bad", "clothing_type": "Shirt", "category": "TOPWEAR", "color": "Black"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_upload_invalid_extension(client: AsyncClient):
    token = await _register_and_login(client)
    img = _create_test_image()
    response = await client.post(
        f"{settings.API_PREFIX}/wardrobe",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.gif", img, "image/jpeg")},
        data={"name": "Bad", "clothing_type": "Shirt", "category": "TOPWEAR", "color": "Black"},
    )
    assert response.status_code == 400


# === List / Pagination Tests ===

@pytest.mark.asyncio
async def test_list_items_empty(client: AsyncClient):
    token = await _register_and_login(client)
    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == []
    assert data["pagination"]["total_items"] == 0


@pytest.mark.asyncio
async def test_list_items_with_pagination(client: AsyncClient):
    token = await _register_and_login(client)
    # Upload 3 items
    for i in range(3):
        await _upload_item(client, token, name=f"Item {i}")

    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe?page=1&page_size=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2
    assert data["pagination"]["total_items"] == 3
    assert data["pagination"]["total_pages"] == 2


# === Get Single Item Tests ===

@pytest.mark.asyncio
async def test_get_item(client: AsyncClient):
    token = await _register_and_login(client)
    upload = await _upload_item(client, token)
    item_id = upload.json()["id"]

    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == item_id


@pytest.mark.asyncio
async def test_get_nonexistent_item(client: AsyncClient):
    token = await _register_and_login(client)
    fake_id = uuid.uuid4()
    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe/{fake_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_other_users_item(client: AsyncClient):
    token1 = await _register_and_login(client)
    upload = await _upload_item(client, token1)
    item_id = upload.json()["id"]

    token2 = await _register_and_login(client)
    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 404


# === Update Tests ===

@pytest.mark.asyncio
async def test_update_item(client: AsyncClient):
    token = await _register_and_login(client)
    upload = await _upload_item(client, token)
    item_id = upload.json()["id"]

    response = await client.put(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Updated Shirt", "color": "Blue"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Shirt"
    assert response.json()["color"] == "Blue"


@pytest.mark.asyncio
async def test_update_other_users_item(client: AsyncClient):
    token1 = await _register_and_login(client)
    upload = await _upload_item(client, token1)
    item_id = upload.json()["id"]

    token2 = await _register_and_login(client)
    response = await client.put(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token2}"},
        json={"name": "Hacked"},
    )
    assert response.status_code == 404


# === Delete Tests ===

@pytest.mark.asyncio
async def test_delete_item(client: AsyncClient):
    token = await _register_and_login(client)
    upload = await _upload_item(client, token)
    item_id = upload.json()["id"]

    response = await client.delete(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204

    # Verify deleted
    get_response = await client.get(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_other_users_item(client: AsyncClient):
    token1 = await _register_and_login(client)
    upload = await _upload_item(client, token1)
    item_id = upload.json()["id"]

    token2 = await _register_and_login(client)
    response = await client.delete(
        f"{settings.API_PREFIX}/wardrobe/{item_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 404


# === Search Tests ===

@pytest.mark.asyncio
async def test_search_by_name(client: AsyncClient):
    token = await _register_and_login(client)
    await _upload_item(client, token, name="Blue Denim Jacket", category="OUTERWEAR", color="Blue")
    await _upload_item(client, token, name="Red T-Shirt", category="TOPWEAR", color="Red")

    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe?search=denim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["pagination"]["total_items"] == 1
    assert "Denim" in data["data"][0]["name"]


# === Filter Tests ===

@pytest.mark.asyncio
async def test_filter_by_category(client: AsyncClient):
    token = await _register_and_login(client)
    await _upload_item(client, token, name="Sneakers", category="FOOTWEAR", clothing_type="Sneakers", color="White")
    await _upload_item(client, token, name="Shirt", category="TOPWEAR", clothing_type="Shirt", color="Blue")

    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe?category=FOOTWEAR",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["pagination"]["total_items"] == 1
    assert data["data"][0]["category"] == "FOOTWEAR"


# === Sort Tests ===

@pytest.mark.asyncio
async def test_sort_by_name_asc(client: AsyncClient):
    token = await _register_and_login(client)
    await _upload_item(client, token, name="Zebra Jacket", category="OUTERWEAR", color="Black")
    await _upload_item(client, token, name="Alpha Shirt", category="TOPWEAR", color="White")

    response = await client.get(
        f"{settings.API_PREFIX}/wardrobe?sort_by=name&sort_order=asc",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"][0]["name"] == "Alpha Shirt"
    assert data["data"][1]["name"] == "Zebra Jacket"
