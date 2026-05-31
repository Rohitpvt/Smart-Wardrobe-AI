from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any
import httpx

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.config import settings
import logging

logger = logging.getLogger(__name__)

auth_router = APIRouter()

@auth_router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
async def register(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Register a new user with email and password.
    """
    if user_in.password != user_in.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first() is not None:
        logger.warning(f"Registration failed: email {user_in.email} already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        gender_preference=user_in.gender_preference,
        style_preference=user_in.style_preference,
        location=user_in.location,
        auth_provider="email"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@auth_router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, user_in: UserLogin, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Login with email and password to get a JWT access token.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if user is None or user.hashed_password is None:
        logger.warning(f"Failed login attempt for email: {user_in.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    if not verify_password(user_in.password, user.hashed_password):
        logger.warning(f"Failed login attempt for email: {user_in.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current logged in user.
    """
    return current_user

from app.schemas.user import UserProfileUpdate

@auth_router.put("/me", response_model=UserResponse)
async def update_users_me(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update current logged in user's profile.
    """
    if profile_data.gender_preference is not None:
        current_user.gender_preference = profile_data.gender_preference
    if profile_data.style_preference is not None:
        current_user.style_preference = profile_data.style_preference
    if profile_data.location is not None:
        current_user.location = profile_data.location
    if profile_data.favorite_colors is not None:
        current_user.favorite_colors = profile_data.favorite_colors
    if profile_data.common_occasions is not None:
        current_user.common_occasions = profile_data.common_occasions
        
    current_user.is_profile_complete = True
    
    await db.commit()
    await db.refresh(current_user)
    return current_user

@auth_router.post("/logout")
async def logout() -> Any:
    """
    Logout (client-side token deletion, server just acknowledges).
    """
    return {"message": "Successfully logged out"}

# --- Google OAuth Flow ---

@auth_router.get("/google")
async def google_auth_url():
    """
    Returns the Google OAuth consent URL.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
        
    scope = "openid email profile"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        f"scope={scope}&"
        f"access_type=offline"
    )
    return {"url": auth_url}

@auth_router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Handles the Google OAuth callback, exchanges code for user info, 
    and returns a JWT token.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google credentials not configured")
        
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Exchange code for Google token
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to authenticate with Google")
            
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        # 2. Get user info from Google
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_response = await client.get(userinfo_url, headers=headers)
        
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
            
        user_info = userinfo_response.json()
        email = user_info.get("email")
        google_id = user_info.get("sub")
        name = user_info.get("name")
        picture = user_info.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google did not provide an email address")
            
        # 3. Find or Create User
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                full_name=name or email.split("@")[0],
                auth_provider="google",
                google_id=google_id,
                profile_image_url=picture
            )
            db.add(user)
        else:
            # Update existing user to link google id if not already linked
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = "google"
                if picture and not user.profile_image_url:
                    user.profile_image_url = picture
                    
        await db.commit()
        await db.refresh(user)
        
        # 4. Generate our JWT
        our_access_token = create_access_token(subject=user.email)
        
        # 5. Redirect to frontend with token
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={our_access_token}")
