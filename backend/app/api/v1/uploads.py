from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
import time

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.upload import PresignRequest, PresignResponse
from app.core.s3 import generate_presigned_post
from app.config import settings

uploads_router = APIRouter()

@uploads_router.post("/presign", response_model=PresignResponse)
async def generate_upload_url(
    request: PresignRequest,
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
        
    # Extract extension from file_name safely
    ext = request.file_name.split(".")[-1].lower() if "." in request.file_name else "jpg"
    if ext == "jpeg":
        ext = "jpg"
        
    timestamp = int(time.time())
    
    # Enforce path structure: users/{user_id}/clothes/{temp_id}/{image_type}-{timestamp}.{ext}
    # This ensures users cannot overwrite other users' files.
    s3_key = f"users/{current_user.id}/clothes/{request.temp_id}/{request.upload_context}-{timestamp}.{ext}"
    
    try:
        presigned_data = generate_presigned_post(s3_key, request.file_type)
        return PresignResponse(
            upload_url=presigned_data["url"],
            fields=presigned_data["fields"],
            s3_key=s3_key
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
