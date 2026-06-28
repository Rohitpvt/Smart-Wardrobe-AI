"""
API dependencies for authentication and authorization.

After Clerk migration (Step 5), get_current_user verifies Clerk-issued
JWTs via JWKS and maps to local User rows.
"""
import logging
from typing import Annotated

import httpx
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.models import User

logger = logging.getLogger(__name__)

# Cache the JWKS client to avoid re-fetching on every request
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    """Lazily create and cache the PyJWKClient for Clerk JWKS verification."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = settings.CLERK_JWKS_URL
        if not jwks_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="CLERK_JWKS_URL not configured",
            )
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def _extract_bearer_token(request: Request) -> str:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning(f"[AUTH_ERROR] Missing or invalid Authorization header: {auth_header}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header.split(" ", 1)[1]


def _verify_clerk_jwt(token: str) -> dict:
    """Verify a Clerk-issued JWT using the JWKS endpoint."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)

        decode_options = {
            "algorithms": ["RS256"],
            "options": {"verify_aud": False},  # Clerk audience is optional
        }
        if settings.CLERK_ISSUER:
            decode_options["issuer"] = settings.CLERK_ISSUER

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER or None,
            options={"verify_aud": False},
            leeway=10,  # Allow 10s clock skew to prevent 'not yet valid (iat)' errors
        )
        return payload
    except jwt.ExpiredSignatureError as e:
        logger.error(f"[JWT_ERROR] ExpiredSignatureError: {e}")
        raise credentials_exception
    except jwt.InvalidTokenError as e:
        logger.error(f"[JWT_ERROR] InvalidTokenError: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"[JWT_ERROR] Unexpected error: {e}")
        raise credentials_exception


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Authenticate via Clerk JWT and return the local User object.

    Flow:
    1. Extract Bearer token from Authorization header
    2. Verify JWT signature via Clerk JWKS
    3. Find local user by clerk_user_id (fast path)
    4. If not found, try linking by verified email (migration path)
    5. If still not found, auto-create a local metadata user
    6. Return the User SQLAlchemy object
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = _extract_bearer_token(request)
    claims = _verify_clerk_jwt(token)

    clerk_user_id = claims.get("sub")
    if not clerk_user_id:
        raise credentials_exception

    # Fast path: find by clerk_user_id
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        if not user.is_active:
            raise credentials_exception
        return user

    # Migration path: link existing user by verified email
    email = (claims.get("email", "") or "").strip().lower()
    if email:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.clerk_user_id = clerk_user_id
            user.auth_provider = "clerk"
            user.email_verified = True
            db.add(user)
            await db.commit()
            await db.refresh(user)
            logger.info(f"[CLERK_MIGRATION] Linked existing user {user.id} to Clerk ID")
            return user

    # Auto-create: new user from Clerk claims
    first_name = claims.get("first_name", "") or claims.get("given_name", "") or "User"
    last_name = claims.get("last_name", "") or claims.get("family_name", "") or None
    avatar_url = claims.get("image_url", "") or claims.get("picture", "") or None

    new_user = User(
        email=email or f"{clerk_user_id}@clerk.placeholder",
        clerk_user_id=clerk_user_id,
        auth_provider="clerk",
        email_verified=bool(email),
        first_name=first_name,
        last_name=last_name,
        avatar_url=avatar_url or None,
        onboarding_completed=False,
        is_active=True,
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
        logger.info(f"[CLERK_MIGRATION] Created new local user {new_user.id} for Clerk ID")
    except Exception:
        await db.rollback()
        raise credentials_exception

    return new_user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
