import pytest
from unittest.mock import patch, MagicMock
from pydantic import ValidationError

from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.schemas import AIClothingExtraction

@pytest.fixture
def gemini_provider():
    return GeminiProvider()

@pytest.mark.asyncio
async def test_successful_structured_response(gemini_provider):
    with patch.object(gemini_provider, 'client') as mock_client:
        mock_response = MagicMock()
        # Provide a valid response string matching the schema
        mock_response.text = '{"name": "Blue Shirt", "clothing_type": "T-Shirt", "category": "TOPS", "color": "Blue", "confidence_score": 90}'
        mock_client.models.generate_content.return_value = mock_response
        
        extraction = await gemini_provider.analyze_clothing_image(b"fake_image", "image/jpeg")
        assert extraction.name == "Blue Shirt"
        assert extraction.category == "TOPS"
        assert extraction.color == "Blue"
        # Backend score: 100 (all crucial fields present). Model score: 90. Avg: 95.
        # Wait, pattern, material, season are missing. 
        # pattern (-5), material (-5), season (-5) -> backend score = 85.
        # (90 + 85) // 2 = 87
        assert extraction.confidence_score == 87

@pytest.mark.asyncio
async def test_invalid_json(gemini_provider):
    with patch.object(gemini_provider, 'client') as mock_client:
        mock_response = MagicMock()
        mock_response.text = '{"invalid_json": '
        mock_client.models.generate_content.return_value = mock_response
        
        with pytest.raises(ValidationError):
            await gemini_provider.analyze_clothing_image(b"fake_image", "image/jpeg")

@pytest.mark.asyncio
async def test_missing_required_fields_confidence(gemini_provider):
    with patch.object(gemini_provider, 'client') as mock_client:
        # Missing category (-30), clothing_type (-20), color (-15)
        # Missing pattern (-5), material (-5), season (-5)
        # Backend score: 100 - 80 = 20
        mock_response = MagicMock()
        mock_response.text = '{"name": "Unknown", "confidence_score": 90, "category": null, "clothing_type": null, "color": null}'
        mock_client.models.generate_content.return_value = mock_response
        
        extraction = await gemini_provider.analyze_clothing_image(b"fake_image", "image/jpeg")
        # (90 model + 20 backend) // 2 = 55
        assert extraction.confidence_score == 55

@pytest.mark.asyncio
async def test_failure_fallback_path(gemini_provider):
    with patch.object(gemini_provider, 'client') as mock_client:
        mock_client.models.generate_content.side_effect = Exception("API Timeout")
        
        with pytest.raises(Exception, match="API Timeout"):
            await gemini_provider.analyze_clothing_image(b"fake_image", "image/jpeg")
