"""
Local file storage service.

Handles image upload, validation, EXIF stripping, and file deletion.
Follows TRD §9 file upload standards.
"""

import os
import uuid
import logging
from pathlib import Path

from fastapi import UploadFile, HTTPException, status
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

# --- Constants ---
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
BLOCKED_MIME_TYPES = {"image/svg+xml"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _get_user_upload_dir(user_id: uuid.UUID) -> Path:
    """Return the upload directory for a specific user, creating it if needed."""
    user_dir = Path(settings.UPLOAD_DIR) / "users" / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def validate_upload(file: UploadFile) -> None:
    """
    Validate an uploaded file against allowed types, extensions, and size.
    Raises HTTPException on any validation failure.
    """
    # Check MIME type
    content_type = file.content_type or ""
    if content_type in BLOCKED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' is explicitly blocked.",
        )
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' is not allowed. Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    # Check extension
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension '{ext}' is not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )
        
    # Check file size efficiently using seek/tell before reading into memory
    # Note: This protects application memory and does not replace infrastructure-level request size limits (e.g. Nginx).
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)  # Reset pointer so subsequent reads work correctly
    
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )


async def save_upload(file: UploadFile, user_id: uuid.UUID) -> str:
    """
    Save an uploaded file to the user's upload directory.
    Returns the relative path to the saved file.

    Steps:
    1. Read file content and validate size.
    2. Strip EXIF metadata using Pillow.
    3. Save to uploads/users/{user_id}/{uuid}.{ext}
    """
    # Read content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Determine extension
    original_ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{original_ext}"

    user_dir = _get_user_upload_dir(user_id)
    file_path = user_dir / unique_filename

    # Strip EXIF metadata using Pillow
    try:
        from io import BytesIO
        img = Image.open(BytesIO(content))
        # Convert to RGB if necessary (handles RGBA PNGs for JPEG saving)
        if original_ext in (".jpg", ".jpeg") and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Save without EXIF data
        save_kwargs = {}
        if original_ext == ".webp":
            save_kwargs["format"] = "WEBP"
        elif original_ext in (".jpg", ".jpeg"):
            save_kwargs["format"] = "JPEG"
        elif original_ext == ".png":
            save_kwargs["format"] = "PNG"
        img.save(str(file_path), **save_kwargs)
        logger.info(f"Saved image (EXIF stripped): {file_path}")
    except Exception as e:
        # If Pillow fails, save the raw file as fallback
        logger.warning(f"EXIF stripping failed, saving raw file: {e}")
        with open(file_path, "wb") as f:
            f.write(content)

    # Return relative path for DB storage
    relative_path = f"uploads/users/{user_id}/{unique_filename}"
    return relative_path


def delete_upload(relative_path: str) -> None:
    """Delete an uploaded file from the filesystem."""
    file_path = Path(relative_path)
    if file_path.exists():
        file_path.unlink()
        logger.info(f"Deleted file: {file_path}")
    else:
        logger.warning(f"File not found for deletion: {file_path}")


def get_absolute_path(relative_path: str) -> Path | None:
    """Convert a relative upload path to absolute and verify it exists."""
    file_path = Path(relative_path)
    if file_path.exists():
        return file_path
    return None
