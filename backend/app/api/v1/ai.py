from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
import logging

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import AIAnalysisRequest, AIClothingAnalysisResponse
from app.ai.service import get_ai_provider
from app.core.s3 import generate_presigned_url

logger = logging.getLogger(__name__)
ai_router = APIRouter()

@ai_router.post("/analyze-clothing", response_model=AIClothingAnalysisResponse)
async def analyze_clothing_image(
    request: AIAnalysisRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Analyze a clothing image stored in S3 and return suggested categorization data.
    """
    # 1. Security Check: Ensure s3_key belongs to current user
    expected_prefix = f"users/{current_user.id}/"
    if not request.s3_key.startswith(expected_prefix):
        logger.warning(f"User {current_user.id} attempted to access unauthorized s3_key: {request.s3_key}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to analyze this image."
        )

    # 2. Generate a temporary read URL for the AI provider
    try:
        temp_image_url = generate_presigned_url(request.s3_key)
        if not temp_image_url:
            raise ValueError("Failed to generate URL.")
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for AI analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not securely access the image for analysis."
        )

    # 3. Call AI Provider
    try:
        provider = get_ai_provider()
        response = await provider.analyze_clothing(image_url=temp_image_url, hints=request.user_hints)
        return response
    except HTTPException:
        # Re-raise Fastapi exceptions (like our 501 placeholders) directly
        raise
    except Exception as e:
        logger.error(f"AI Provider error during analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The AI analysis service failed to process the image."
        )
