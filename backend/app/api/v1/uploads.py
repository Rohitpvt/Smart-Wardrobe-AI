from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
import time

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.upload import PresignRequest, PresignResponse
from app.core.s3 import generate_presigned_post
from app.core.rate_limit import limiter
from fastapi import Request
from app.config import settings
import re
import logging

logger = logging.getLogger(__name__)

uploads_router = APIRouter()

@uploads_router.post("/presign", response_model=PresignResponse)
@limiter.limit("10/minute")
async def generate_upload_url(
    request: Request,
    payload: PresignRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Generate an S3 presigned POST URL for secure frontend-to-S3 direct uploads.
    """
    if not settings.AWS_S3_BUCKET_NAME or not settings.AWS_ACCESS_KEY_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="AWS S3 is not configured on the server."
        )
        
    # Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if payload.file_type not in allowed_types:
        logger.warning(f"Invalid file type attempted: {payload.file_type}")
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed.")
        
    # Extract extension from file_name safely
    ext = payload.file_name.split(".")[-1].lower() if "." in payload.file_name else "jpg"
    if ext == "jpeg":
        ext = "jpg"
    
    # Sanitize file_name
    safe_file_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '', payload.file_name)
    if not safe_file_name:
        safe_file_name = "upload"
        
    timestamp = int(time.time())
    
    # Enforce path structure: users/{user_id}/clothes/{temp_id}/{image_type}-{timestamp}.{ext}
    # This ensures users cannot overwrite other users' files and prevents traversal.
    s3_key = f"users/{current_user.id}/clothes/{payload.temp_id}/{payload.upload_context}-{timestamp}.{ext}"
    
    try:
        presigned_data = generate_presigned_post(s3_key, payload.file_type, max_mb=10)
        return PresignResponse(
            upload_url=presigned_data["url"],
            fields=presigned_data["fields"],
            s3_key=s3_key
        )
    except ValueError as e:
        logger.error(f"S3 Presign Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
