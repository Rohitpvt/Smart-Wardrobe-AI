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


import jwt as pyjwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

class MediaTokenResponse(BaseModel):
    media_token: str
    expires_in: int

def _create_media_token(user_id: str, file_path: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(seconds=300)
    payload = {
        "sub": str(user_id),
        "path": file_path,
        "exp": expires,
        "type": "media_access"
    }
    return pyjwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def _verify_media_access_token(token: str) -> dict:
    try:
        payload = pyjwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "media_access":
            raise HTTPException(status_code=403, detail="Invalid token type")
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Media token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid media token")

@router.get("/media-token", response_model=MediaTokenResponse)
async def generate_media_token(
    path: str,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a short-lived media token for a specific file.
    """
    # Prevent path traversal
    if ".." in path or path.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid path")
        
    # Verify the path belongs to the user
    expected_prefix = f"uploads/users/{current_user.id}/"
    if not path.startswith(expected_prefix):
        # Return generic 403 or 404 to not leak info
        raise HTTPException(status_code=404, detail="Resource not found")
        
    token = _create_media_token(str(current_user.id), path)
    return MediaTokenResponse(media_token=token, expires_in=300)

@router.get("/serve/{path:path}")
async def serve_media(
    path: str,
    media_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Serve a media file using a short-lived media token.
    """
    payload = _verify_media_access_token(media_token)
    
    if payload.get("path") != path:
        raise HTTPException(status_code=403, detail="Token not valid for this path")
        
    user_id = payload.get("sub")
    
    # Path traversal check
    if ".." in path or path.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid path")
        
    absolute_path = storage_service.get_absolute_path(path)
    if not absolute_path:
        raise HTTPException(status_code=404, detail="Resource not found")
        
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
