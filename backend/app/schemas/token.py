from pydantic import BaseModel, field_validator
from app.schemas.auth_validation import sanitize_email, validate_password_security

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None
    type: str | None = None

class LoginData(BaseModel):
    email: str
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        return sanitize_email(v)

    @field_validator("password", mode="before")
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        return validate_password_security(v)
