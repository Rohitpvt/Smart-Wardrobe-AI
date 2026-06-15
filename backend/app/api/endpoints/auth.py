from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import secrets

from app.core.database import get_db
from app.core import security
from app.core.config import settings
from app.core.lockout import record_failed_attempt, is_locked_out, reset_failed_attempts
from app.core.rate_limit import limiter
from app.models import User, RefreshToken
from app.schemas import UserCreate, UserRead, Token, LoginData
from app.api.dependencies import get_current_user

router = APIRouter()

def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

def set_csrf_cookie(response: Response, token: str):
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False, # Needs to be readable by JS
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

def set_access_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )

def clear_access_cookie(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )

def clear_csrf_cookie(response: Response):
    response.delete_cookie(
        key="csrf_token",
        httponly=False,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    stmt = select(User).where(User.email == user_in.email.lower())
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user = User(
        email=user_in.email.lower(),
        password_hash=security.hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        city=user_in.city,
        country_code=user_in.country_code,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed.")

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginData, response: Response, db: AsyncSession = Depends(get_db)):
    email = login_data.email.lower()
    if is_locked_out(email):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password", # Generic error per TRD
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(login_data.password, user.password_hash):
        record_failed_attempt(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Success: reset failed attempts
    reset_failed_attempts(email)

    access_token = security.create_access_token(data={"sub": user.email})
    
    # Create refresh token (secure random string rather than JWT to allow easy DB revocation matching)
    # TRD says "Refresh Token Hashing" -> We issue a secure token, hash it, store it.
    raw_refresh_token = secrets.token_urlsafe(32)
    # Re-use bcrypt to hash the refresh token or just SHA256. Bcrypt is fine since we do it once per login.
    # Actually, SHA256 is better for refresh tokens since they are high entropy and don't need work factor.
    import hashlib
    token_hash = hashlib.sha256(raw_refresh_token.encode()).hexdigest()
    
    # Issue JWT refresh token per "P2.4 JWT Refresh Token Generation"
    # Wait, the prompt says "JWT Refresh Tokens". Let's issue a JWT containing a `jti` (JWT ID), store the hash of the `jti`.
    jti = secrets.token_urlsafe(32)
    jti_hash = hashlib.sha256(jti.encode()).hexdigest()
    refresh_token = security.create_refresh_token(data={"sub": user.email, "jti": jti})
    
    from datetime import datetime, timezone, timedelta
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    rt = RefreshToken(user_id=user.id, token_hash=jti_hash, expires_at=expires_at)
    db.add(rt)
    await db.commit()

    set_refresh_cookie(response, refresh_token)
    set_access_cookie(response, access_token)
    
    csrf_token = secrets.token_urlsafe(32)
    set_csrf_cookie(response, csrf_token)

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="CSRF token verification failed")

    try:
        payload = security.decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
        jti = payload.get("jti")
        if not email or not jti:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    import hashlib
    jti_hash = hashlib.sha256(jti.encode()).hexdigest()

    # Find the refresh token in the database
    stmt = select(RefreshToken).where(RefreshToken.token_hash == jti_hash)
    result = await db.execute(stmt)
    rt = result.scalar_one_or_none()

    if not rt:
        # Token not found or already revoked (could be token theft)
        clear_refresh_cookie(response)
        clear_access_cookie(response)
        clear_csrf_cookie(response)
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

    # Fetch user
    user_stmt = select(User).where(User.email == email)
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate the token (delete old, create new)
    await db.delete(rt)
    
    new_jti = secrets.token_urlsafe(32)
    new_jti_hash = hashlib.sha256(new_jti.encode()).hexdigest()
    new_refresh_token = security.create_refresh_token(data={"sub": user.email, "jti": new_jti})
    
    from datetime import datetime, timezone, timedelta
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_rt = RefreshToken(user_id=user.id, token_hash=new_jti_hash, expires_at=expires_at)
    db.add(new_rt)
    await db.commit()

    set_refresh_cookie(response, new_refresh_token)
    access_token = security.create_access_token(data={"sub": user.email})
    set_access_cookie(response, access_token)
    
    csrf_token = secrets.token_urlsafe(32)
    set_csrf_cookie(response, csrf_token)

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="CSRF token verification failed")

    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = security.decode_token(token)
            jti = payload.get("jti")
            if jti:
                import hashlib
                jti_hash = hashlib.sha256(jti.encode()).hexdigest()
                stmt = select(RefreshToken).where(RefreshToken.token_hash == jti_hash)
                result = await db.execute(stmt)
                rt = result.scalar_one_or_none()
                if rt:
                    await db.delete(rt)
                    await db.commit()
        except Exception:
            pass # Ignore invalid tokens on logout
            
    clear_refresh_cookie(response)
    clear_access_cookie(response)
    clear_csrf_cookie(response)
    return {"message": "Logged out successfully"}
