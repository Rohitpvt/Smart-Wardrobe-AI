import boto3
from botocore.exceptions import ClientError
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def get_s3_client():
    """Create and return a boto3 client configured with settings."""
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_S3_BUCKET_NAME:
        # Avoid crashing immediately if missing, let endpoints handle it gracefully
        return None
        
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

def generate_presigned_post(s3_key: str, file_type: str, max_mb: int = 5) -> dict:
    """
    Generate a presigned POST URL to allow a user to securely upload a file directly to S3.
    """
    client = get_s3_client()
    if not client:
        raise ValueError("AWS S3 not configured.")
        
    try:
        response = client.generate_presigned_post(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=s3_key,
            Fields={
                "Content-Type": file_type
            },
            Conditions=[
                {"Content-Type": file_type},
                ["content-length-range", 0, max_mb * 1024 * 1024]  # 5MB max
            ],
            ExpiresIn=settings.AWS_S3_PRESIGNED_EXPIRE_SECONDS
        )
        return response
    except ClientError as e:
        logger.error(f"Failed to generate presigned POST URL: {e}")
        raise ValueError("Could not generate upload URL.")

def generate_presigned_url(s3_key: str) -> str:
    """
    Generate a presigned GET URL for viewing a private object securely.
    """
    client = get_s3_client()
    if not client or not s3_key:
        return ""
        
    try:
        url = client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.AWS_S3_BUCKET_NAME,
                'Key': s3_key
            },
            ExpiresIn=settings.AWS_S3_PRESIGNED_EXPIRE_SECONDS
        )
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        return ""
