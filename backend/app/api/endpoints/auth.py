from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import secrets
from pydantic import BaseModel

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
    email_clean = user_in.email.strip().lower()
    # Check if user exists
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user = User(
        email=email_clean,
        password_hash=security.hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        city=user_in.city,
        country_code=user_in.country_code,
        age=user_in.age,
        gender=user_in.gender,
        height_cm=user_in.height_cm,
        body_type=user_in.body_type,
        fashion_experience=user_in.fashion_experience,
        primary_style=user_in.primary_style,
        onboarding_completed=True, # Local reg implies full onboarding in this app
        auth_provider="local",
        email_verified=False
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed.")

@router.get("/check-email")
async def check_email(email: str, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == email.strip().lower())
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        return {"available": False}
    return {"available": True}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginData, response: Response, db: AsyncSession = Depends(get_db)):
    email = login_data.email.strip().lower()
    if is_locked_out(email):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password", # Generic error per TRD
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user and user.auth_provider == 'google' and user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google Sign-In. Please continue with Google.",
        )

    if not user or not user.password_hash or not security.verify_password(login_data.password, user.password_hash):
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
    
    user.last_login_at = datetime.now(timezone.utc)
    
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

class GoogleLoginData(BaseModel):
    credential: str

class GoogleRegisterCompleteData(BaseModel):
    age: int
    gender: str
    height_cm: int | None = None
    body_type: str | None = None
    fashion_experience: str | None = None
    primary_style: str | None = None


import base64
import json
from datetime import datetime, timezone

def _safe_decode_google_jwt_claims(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {"error": f"Expected 3 JWT segments, got {len(parts)}"}

        payload = parts[1]
        payload += "=" * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload.encode("utf-8"))
        return json.loads(decoded.decode("utf-8"))
    except Exception as exc:
        return {"error": str(exc)}

def _verify_google_token(credential: str, endpoint_context: str = "unknown"):
    """Verify a Google ID token and return the decoded info. Raises HTTPException on failure."""
    if not credential:
        raise HTTPException(status_code=400, detail="Missing Google ID token credential")

    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
    if not client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        claims = _safe_decode_google_jwt_claims(credential)
        logger.info("Google token diagnostic:")
        logger.info("  token_segments=%s", len(credential.split(".")))
        logger.info("  backend_google_client_id=%r", client_id)
        logger.info("  token_aud=%r", claims.get("aud"))
        logger.info("  token_iss=%r", claims.get("iss"))
        logger.info("  token_email=%r", claims.get("email"))
        logger.info("  token_exp=%r", claims.get("exp"))
        logger.info("  token_iat=%r", claims.get("iat"))
        logger.info("  current_utc=%s", datetime.now(timezone.utc).timestamp())
        logger.info("  aud_matches_backend=%s", claims.get("aud") == client_id)
        
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), client_id, clock_skew_in_seconds=60
        )
    except ValueError as e:
        import logging
        import os
        logging.getLogger(__name__).error(f"Google Token Verification Error: {e}")
        
        detail_payload = "Invalid Google token"
        
        # Always write artifact in dev mode or prod (for debug)
        claims = _safe_decode_google_jwt_claims(credential)
        debug_info = {
            "exception_type": type(e).__name__,
            "exception_message": str(e),
            "token_segments": len(credential.split(".")) if credential else 0,
            "token_aud": claims.get("aud"),
            "backend_google_client_id": client_id,
            "aud_matches_backend": claims.get("aud") == client_id,
            "token_iss": claims.get("iss"),
            "token_email": claims.get("email"),
            "token_exp": claims.get("exp"),
            "token_iat": claims.get("iat"),
            "current_utc": datetime.now(timezone.utc).timestamp(),
            "endpoint_context": endpoint_context,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        artifact_dir = os.path.join(os.getcwd(), "artifacts")
        os.makedirs(artifact_dir, exist_ok=True)
        artifact_path = os.path.join(artifact_dir, "GOOGLE_LATEST_TOKEN_ERROR.json")
        try:
            with open(artifact_path, "w") as f:
                json.dump(debug_info, f, indent=2)
        except Exception as file_err:
            logging.getLogger(__name__).error(f"Failed to write Google error artifact: {file_err}")
        
        if settings.DEBUG_GOOGLE_OAUTH:
            raise HTTPException(status_code=401, detail={"message": detail_payload, "debug": debug_info})
            
        raise HTTPException(status_code=401, detail=detail_payload)
    return idinfo


@router.post("/google/register-start")
async def google_register_start(request: Request, login_data: GoogleLoginData, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Phase 9.11G-C: Verify Google token and check if user exists.
    Does NOT create a user or issue login cookies.
    Sets a short-lived HttpOnly pending registration cookie for new users.
    """
    idinfo = _verify_google_token(login_data.credential, endpoint_context="google/register-start")

    email = idinfo.get("email", "").strip().lower()
    google_id = idinfo.get("sub")
    first_name = idinfo.get("given_name", "")
    last_name = idinfo.get("family_name", "")
    avatar_url = idinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Check if user already exists
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        return {"status": "account_exists"}

    # New user — issue a short-lived pending registration token (10 min)
    pending_token = security.create_google_pending_token(data={
        "google_id": google_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "avatar_url": avatar_url or "",
    })
    
    response.set_cookie(
        key="google_pending_registration",
        value=pending_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=10 * 60,
    )

    return {
        "status": "new_google_user",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "avatar_url": avatar_url or "",
    }


@router.get("/google/pending-registration")
async def get_google_pending_registration(request: Request):
    """
    Phase 9.11G-C: Allows /register to resume Google registration after redirect from /login.
    """
    token = request.cookies.get("google_pending_registration")
    if not token:
        return {"status": "none"}
    
    try:
        payload = security.decode_token(token)
        if payload.get("type") != "google_pending_registration":
            return {"status": "none"}
            
        return {
            "status": "pending",
            "email": payload.get("email", ""),
            "first_name": payload.get("first_name", ""),
            "last_name": payload.get("last_name", ""),
            "avatar_url": payload.get("avatar_url", ""),
        }
    except Exception:
        return {"status": "none"}


@router.post("/google/register-cancel")
async def google_register_cancel(response: Response):
    """
    Cancel a pending Google registration by clearing the cookie.
    """
    response.delete_cookie(
        key="google_pending_registration",
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )
    return {"status": "cancelled"}


@router.post("/google/register-complete")
async def google_register_complete(request: Request, data: GoogleRegisterCompleteData, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Phase 9.11G-C: Create a Google-backed user after Step 2 & Step 3 profile data is collected.
    Uses HttpOnly cookie. Does NOT auto-login. Frontend must redirect to /login.
    """
    token = request.cookies.get("google_pending_registration")
    if not token:
        raise HTTPException(status_code=400, detail="Pending registration session not found or expired")

    # Decode and verify the pending token
    try:
        payload = security.decode_token(token)
        if payload.get("type") != "google_pending_registration":
            raise HTTPException(status_code=400, detail="Invalid pending registration token type")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired pending registration token")

    email = payload.get("email", "").strip().lower()
    google_id = payload.get("google_id")
    first_name = payload.get("first_name", "")
    last_name = payload.get("last_name", "")
    avatar_url = payload.get("avatar_url")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Invalid pending token data")

    # Re-check email uniqueness (prevents race conditions)
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        email=email,
        password_hash=None,
        google_id=google_id,
        first_name=first_name,
        last_name=last_name,
        auth_provider="google",
        email_verified=True,
        avatar_url=avatar_url if avatar_url else None,
        onboarding_completed=True,
        first_login_redirect_pending=True,
        last_login_at=None,
        age=data.age,
        gender=data.gender,
        height_cm=data.height_cm,
        body_type=data.body_type,
        fashion_experience=data.fashion_experience,
        primary_style=data.primary_style,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed. Please try again.")

    response.delete_cookie(
        key="google_pending_registration",
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
    )

    return {"status": "registration_complete"}


@router.post("/google/login")
async def google_login(request: Request, login_data: GoogleLoginData, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Phase 9.11G-C: Login existing Google or linked users ONLY.
    Does NOT auto-create users. Sets pending registration cookie for unregistered users.
    Returns intelligent redirects based on first_login_redirect_pending.
    """
    idinfo = _verify_google_token(login_data.credential, endpoint_context="google/login")

    email = idinfo.get("email", "").strip().lower()
    google_id = idinfo.get("sub")
    first_name = idinfo.get("given_name", "")
    last_name = idinfo.get("family_name", "")
    avatar_url = idinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Look up by google_id first, then by email
    stmt = select(User).where(User.google_id == google_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

    if not user:
        # No account found — do NOT create one. Create pending token and direct to /register.
        pending_token = security.create_google_pending_token(data={
            "google_id": google_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "avatar_url": avatar_url or "",
        })
        
        response.set_cookie(
            key="google_pending_registration",
            value=pending_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=10 * 60,
        )
        return {"status": "registration_required", "redirect_to": "/register"}

    # Flow 4 restriction: Local account tries to login with Google
    if user.auth_provider == "local" and not user.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is registered with a password. Please sign in with your email and password."
        )

    # Account linking: link Google ID if not yet linked
    needs_commit = False
    if user.google_id != google_id:
        user.google_id = google_id
        needs_commit = True
    if user.auth_provider == "local":
        user.auth_provider = "local_google"
        needs_commit = True
    if not user.avatar_url and avatar_url:
        user.avatar_url = avatar_url
        needs_commit = True
    if not user.email_verified:
        user.email_verified = True
        needs_commit = True

    from datetime import datetime, timezone, timedelta
    
    # Evaluate redirect logic
    if user.first_login_redirect_pending:
        redirect_to = "/"
        user.first_login_redirect_pending = False
        needs_commit = True
    else:
        redirect_to = "/dashboard"

    user.last_login_at = datetime.now(timezone.utc)
    needs_commit = True

    if needs_commit:
        await db.commit()
        await db.refresh(user)

    # Issue session tokens
    import hashlib

    access_token = security.create_access_token(data={"sub": user.email})

    jti = secrets.token_urlsafe(32)
    jti_hash = hashlib.sha256(jti.encode()).hexdigest()
    refresh_token = security.create_refresh_token(data={"sub": user.email, "jti": jti})

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    rt = RefreshToken(user_id=user.id, token_hash=jti_hash, expires_at=expires_at)
    db.add(rt)
    await db.commit()

    set_refresh_cookie(response, refresh_token)
    set_access_cookie(response, access_token)

    csrf_token = secrets.token_urlsafe(32)
    set_csrf_cookie(response, csrf_token)

    return {"status": "login_success", "redirect_to": redirect_to, "access_token": access_token, "token_type": "bearer"}


@router.post("/google/link")
async def google_link(request: Request, login_data: GoogleLoginData, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    idinfo = _verify_google_token(login_data.credential)

    google_id = idinfo.get("sub")
    avatar_url = idinfo.get("picture")

    current_user.google_id = google_id
    if current_user.auth_provider == "local":
        current_user.auth_provider = "local_google"
    if not current_user.avatar_url:
        current_user.avatar_url = avatar_url

    await db.commit()
    return {"message": "Google account linked successfully"}

@router.get("/providers")
async def get_providers():
    return {
        "providers": ["local", "google"]
    }

@router.get("/google/debug/latest-error")
async def get_google_latest_error():
    if not settings.DEBUG_GOOGLE_OAUTH:
        raise HTTPException(status_code=404, detail="Debug endpoint disabled")
    import os
    import json
    artifact_path = os.path.join(os.getcwd(), "artifacts", "GOOGLE_LATEST_TOKEN_ERROR.json")
    if not os.path.exists(artifact_path):
        return {"message": "No error artifact found"}
    try:
        with open(artifact_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read artifact: {e}")


