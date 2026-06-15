import io
import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from pydantic import ValidationError
import uuid

from app.core.config import settings
from tests.api.test_wardrobe import _register_and_login, _create_test_image

from unittest.mock import patch, MagicMock, AsyncMock
from app.services.ai.schemas import AIClothingExtraction

@pytest.fixture
def mock_gemini():
    with patch("app.api.endpoints.uploads.gemini_provider") as mock:
        mock.analyze_clothing_image = AsyncMock(return_value=AIClothingExtraction(
            name="Mocked Name",
            clothing_type="T-Shirt",
            category="TOPWEAR",
            color="Blue",
            confidence_score=90
        ))
        yield mock

@pytest.mark.asyncio
async def test_analyze_valid_image(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    img = _create_test_image()
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.jpg", img, "image/jpeg")}
    )
    assert response.status_code == 200
    mock_gemini.analyze_clothing_image.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_invalid_mime_type(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    fake_file = io.BytesIO(b"<svg></svg>")
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.svg", fake_file, "image/svg+xml")}
    )
    assert response.status_code == 400
    mock_gemini.analyze_clothing_image.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_invalid_extension(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    img = _create_test_image()
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.gif", img, "image/jpeg")}
    )
    assert response.status_code == 400
    mock_gemini.analyze_clothing_image.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_oversized_file(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    # 10MB limit. Create a buffer slightly larger than 10MB.
    large_file = io.BytesIO(b"0" * (10 * 1024 * 1024 + 10))
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("large.jpg", large_file, "image/jpeg")}
    )
    assert response.status_code == 413
    assert "exceeds maximum" in response.json()["detail"]
    mock_gemini.analyze_clothing_image.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_missing_authentication(client: AsyncClient, mock_gemini):
    img = _create_test_image()
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        files={"image": ("test.jpg", img, "image/jpeg")}
    )
    assert response.status_code == 401
    mock_gemini.analyze_clothing_image.assert_not_called()


@pytest.mark.asyncio
async def test_analyze_gemini_timeout(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    img = _create_test_image()
    
    mock_gemini.analyze_clothing_image.side_effect = Exception("API Timeout")
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.jpg", img, "image/jpeg")}
    )
    assert response.status_code == 500
    assert "internal error" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_gemini_malformed_response(client: AsyncClient, mock_gemini):
    token = await _register_and_login(client)
    img = _create_test_image()
    
    # Mock a validation error (from pydantic)
    from pydantic_core import InitErrorDetails
    mock_gemini.analyze_clothing_image.side_effect = ValidationError.from_exception_data(
        title="AIClothingExtraction", line_errors=[]
    )
    
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.jpg", img, "image/jpeg")}
    )
    assert response.status_code == 422
    assert "malformed data" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_rate_limit(client: AsyncClient, mock_gemini):
    # Ensure fresh token to avoid cross-test rate limit bleeding
    token = await _register_and_login(client)
    
    # Make 10 valid requests
    for i in range(10):
        img = _create_test_image()
        response = await client.post(
            f"{settings.API_PREFIX}/uploads/analyze",
            headers={"Authorization": f"Bearer {token}"},
            files={"image": ("test.jpg", img, "image/jpeg")}
        )
        assert response.status_code == 200, f"Request {i+1} failed"
    
    # 11th request should be rate limited
    mock_gemini.analyze_clothing_image.reset_mock()
    img = _create_test_image()
    response = await client.post(
        f"{settings.API_PREFIX}/uploads/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test.jpg", img, "image/jpeg")}
    )
    
    assert response.status_code == 429
    mock_gemini.analyze_clothing_image.assert_not_called()
