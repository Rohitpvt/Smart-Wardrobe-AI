from pydantic import BaseModel, Field
from typing import Literal

class PresignRequest(BaseModel):
    file_name: str
    file_type: Literal["image/jpeg", "image/jpg", "image/png", "image/webp"]
    upload_context: Literal["front", "back", "label", "thumbnail"]
    temp_id: str = Field(..., description="A temporary client-generated UUID to group images before item creation")

class PresignResponse(BaseModel):
    upload_url: str
    fields: dict
    s3_key: str
