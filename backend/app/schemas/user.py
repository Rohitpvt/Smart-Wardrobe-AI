import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import re
from typing import Any
from app.schemas.auth_validation import sanitize_email, sanitize_name, validate_password_security

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field("User", max_length=100)
    last_name: str | None = Field(None, max_length=100)
    city: str | None = Field(None, max_length=100)
    country_code: str | None = Field(None, max_length=10)
    styling_preference: str | None = Field(None, max_length=20)
    
    auth_provider: str = "local"
    email_verified: bool = False
    avatar_url: str | None = Field(None, max_length=500)
    onboarding_completed: bool = False
    
    # Weather Targeting
    weather_city: str | None = Field(None, max_length=100)
    weather_country: str | None = Field(None, max_length=10)
    weather_latitude: float | None = Field(None, ge=-90, le=90)
    weather_longitude: float | None = Field(None, ge=-180, le=180)
    weather_location_enabled: bool = True
    
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

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_field(cls, v: Any) -> Any:
        return sanitize_email(v)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def validate_name_fields(cls, v: Any) -> Any:
        return sanitize_name(v)

class UserCreate(UserBase):
    password: str | None = Field(None, min_length=8, max_length=100)
    age: int = Field(..., ge=13, le=100)
    gender: str = Field(..., max_length=50)
    
    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_password_security(v)

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
    
    # Weather Targeting
    weather_city: str | None = Field(None, max_length=100)
    weather_country: str | None = Field(None, max_length=10)
    weather_latitude: float | None = Field(None, ge=-90, le=90)
    weather_longitude: float | None = Field(None, ge=-180, le=180)
    weather_location_enabled: bool | None = None
    
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

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def validate_name_fields(cls, v: Any) -> Any:
        return sanitize_name(v)

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password", mode="before")
    @classmethod
    def validate_new_pwd(cls, v: str) -> str:
        return validate_password_security(v)
