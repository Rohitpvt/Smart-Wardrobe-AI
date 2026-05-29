from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    
class UserCreate(UserBase):
    password: str
    confirm_password: str
    gender_preference: Optional[str] = None
    style_preference: Optional[str] = None
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    gender_preference: Optional[str] = None
    style_preference: Optional[str] = None
    location: Optional[str] = None
    favorite_colors: Optional[List[str]] = None
    common_occasions: Optional[List[str]] = None

class UserResponse(UserBase):
    id: UUID
    auth_provider: str
    profile_image_url: Optional[str] = None
    gender_preference: Optional[str] = None
    style_preference: Optional[str] = None
    location: Optional[str] = None
    favorite_colors: Optional[List[str]] = None
    common_occasions: Optional[List[str]] = None
    is_profile_complete: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
