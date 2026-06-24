"""
Image serving endpoint.

Serves uploaded images behind authentication.
Users may only access their own images — returns 404 for unauthorized attempts.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Request
from fastapi.responses import FileResponse
from pydantic import ValidationError

from app.models import User
from app.api.dependencies import get_current_user
from app.services.storage import local as storage_service
from app.services.ai import ai_provider, AIClothingExtraction
from app.core.rate_limit import limiter

router = APIRouter()


from app.core import security
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

@router.get("/users/{user_id}/{filename}")
async def serve_upload(
    user_id: uuid.UUID,
    filename: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Serve an uploaded image file.
    Accepts token via query parameter for <img> tags or Authorization header.
    """
    token = request.query_params.get("token")
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        token = auth_header.split(" ")[1]

    try:
        payload = security.decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing email in token")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token decode failed: {str(e)}")

    result = await db.execute(select(User).where(User.email == email))
    current_user = result.scalar_one_or_none()
    if not current_user or str(current_user.id) != str(user_id):
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
@limiter.limit("10/minute")
async def analyze_upload(
    request: Request,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
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
        extraction = await ai_provider.analyze_clothing_image(
            db=db,
            user_id=current_user.id,
            feature_name="analyze_clothing_image",
            image_data=content,
            mime_type=image.content_type or "image/jpeg"
        )
        return extraction
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"AI returned malformed data: {str(e)}"
        )
    except Exception as e:
        # We log the actual error in the provider; return a generic 500 to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze image due to an internal error."
        )
