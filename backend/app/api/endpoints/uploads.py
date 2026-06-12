"""
Image serving endpoint.

Serves uploaded images behind authentication.
Users may only access their own images — returns 404 for unauthorized attempts.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import FileResponse

from app.models import User
from app.api.dependencies import get_current_user
from app.services.storage import local as storage_service
from app.services.ai import gemini_provider, AIClothingExtraction

router = APIRouter()


@router.get("/{user_id}/{filename}")
async def serve_upload(
    user_id: uuid.UUID,
    filename: str,
    current_user: User = Depends(get_current_user),
):
    """
    Serve an uploaded image file.
    Requires authentication. Returns 404 if the requesting user
    does not own the image (prevents enumeration).
    """
    # Ownership check — return 404 to prevent user enumeration
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    relative_path = f"uploads/users/{user_id}/{filename}"
    absolute_path = storage_service.get_absolute_path(relative_path)

    if not absolute_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return FileResponse(str(absolute_path))

@router.post("/analyze", response_model=AIClothingExtraction)
async def analyze_upload(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze an uploaded image using Gemini AI.
    Requires authentication. Does not permanently save the image.
    """
    storage_service.validate_upload(image)
    
    # Read the image content
    content = await image.read()
    
    try:
        # Analyze with Gemini
        extraction = await gemini_provider.analyze_clothing_image(
            image_data=content,
            mime_type=image.content_type or "image/jpeg"
        )
        return extraction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze image: {str(e)}"
        )
