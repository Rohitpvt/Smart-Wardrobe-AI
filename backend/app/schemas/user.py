import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import re

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    city: str | None = Field(None, max_length=100)
    country_code: str | None = Field(None, max_length=10)
    styling_preference: str | None = Field(None, max_length=20)
    
    auth_provider: str = "local"
    email_verified: bool = False
    avatar_url: str | None = Field(None, max_length=500)
    onboarding_completed: bool = False
    
    # Extended Profile Fields
    age: int | None = Field(None, ge=13, le=100)
    gender: str | None = Field(None, max_length=50)
    height_cm: int | None = Field(None, ge=100, le=250)
    body_type: str | None = Field(None, max_length=50)
    fashion_experience: str | None = Field(None, max_length=50)
    primary_style: str | None = Field(None, max_length=50)
    profile_image_url: str | None = Field(None, max_length=500)
    occupation: str | None = Field(None, max_length=100)
    climate_region: str | None = Field(None, max_length=100)
    favorite_colors: str | None = Field(None, max_length=255)
    disliked_colors: str | None = Field(None, max_length=255)
    preferred_fit: str | None = Field(None, max_length=50)
    budget_preference: str | None = Field(None, max_length=50)

class UserCreate(UserBase):
    password: str | None = Field(None, min_length=8, max_length=100)
    age: int = Field(..., ge=13, le=100)
    gender: str = Field(..., max_length=50)
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[^a-zA-Z0-9]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    city: str | None = Field(None, max_length=100)
    country_code: str | None = Field(None, max_length=10)
    styling_preference: str | None = Field(None, max_length=20)
    
    # Extended Profile Fields
    age: int | None = Field(None, ge=13, le=100)
    gender: str | None = Field(None, max_length=50)
    height_cm: int | None = Field(None, ge=100, le=250)
    body_type: str | None = Field(None, max_length=50)
    fashion_experience: str | None = Field(None, max_length=50)
    primary_style: str | None = Field(None, max_length=50)
    profile_image_url: str | None = Field(None, max_length=500)
    occupation: str | None = Field(None, max_length=100)
    climate_region: str | None = Field(None, max_length=100)
    favorite_colors: str | None = Field(None, max_length=255)
    disliked_colors: str | None = Field(None, max_length=255)
    preferred_fit: str | None = Field(None, max_length=50)
    budget_preference: str | None = Field(None, max_length=50)
    onboarding_completed: bool | None = None

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
