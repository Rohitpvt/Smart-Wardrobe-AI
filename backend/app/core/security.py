"""
Security utilities.

Provides password hashing and JWT token operations.
Implements bcrypt hashing per TRD §8.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


# --- Password Hashing (bcrypt) ---

import hmac
import hashlib
import os
import logging
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with cost factor 12."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Standard secure bcrypt verification (cost independent but must be bcrypt)."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            stored_hash.encode("utf-8"),
        )
    except ValueError:
        # Not a valid bcrypt hash
        return False

def needs_rehash(stored_hash: str) -> bool:
    """Check if the hash requires an upgrade (MD5, SHA-1, low-cost bcrypt, unknown)."""
    if stored_hash.startswith("$2") and len(stored_hash) == 60:
        # Extract cost factor
        try:
            cost = int(stored_hash.split("$")[2])
            if cost < 12:
                return True
            return False
        except (IndexError, ValueError):
            return True
    return True

async def verify_and_upgrade_password(plain_password: str, user, db: AsyncSession) -> bool:
    """Verify password and seamlessly upgrade weak hashes."""
    stored_hash = user.password_hash
    if not stored_hash:
        return False
        
    is_valid = False
    
    # 1. Check if it's a valid bcrypt hash first (most common case)
    if stored_hash.startswith("$2") and len(stored_hash) == 60:
        is_valid = verify_password(plain_password, stored_hash)
    
    # 2. Check Legacy MD5 (32 hex chars)
    elif len(stored_hash) == 32 and all(c in "0123456789abcdefABCDEF" for c in stored_hash):
        md5_hash = hashlib.md5(plain_password.encode('utf-8')).hexdigest()
        is_valid = hmac.compare_digest(md5_hash.lower(), stored_hash.lower())
        
    # 3. Check Legacy SHA-1 (40 hex chars)
    elif len(stored_hash) == 40 and all(c in "0123456789abcdefABCDEF" for c in stored_hash):
        sha1_hash = hashlib.sha1(plain_password.encode('utf-8')).hexdigest()
        is_valid = hmac.compare_digest(sha1_hash.lower(), stored_hash.lower())
        
    # 4. Check Legacy Plaintext (if enabled)
    else:
        allow_plaintext = os.environ.get("ALLOW_LEGACY_PLAINTEXT_PASSWORD_MIGRATION", "false").lower() == "true"
        if allow_plaintext:
            is_valid = hmac.compare_digest(plain_password.encode('utf-8'), stored_hash.encode('utf-8'))
            if is_valid:
                logger.warning("[PASSWORD_AUDIT] Legacy plaintext migration performed. "
                               "This is insecure and should be disabled once migration is complete.")
        else:
            # Unknown hash format, reject generically per TRD
            return False

    if is_valid and needs_rehash(stored_hash):
        # Upgrade the hash
        new_hash = hash_password(plain_password)
        user.password_hash = new_hash
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
            # Safe log, no password data
            logger.info(f"[PASSWORD_AUDIT] Hash upgraded for user {user.id}")
        except Exception as e:
            await db.rollback()
            logger.error(f"[PASSWORD_AUDIT] Failed to save upgraded hash for user {user.id}: {e}")
            
    return is_valid


# --- JWT Token Operations ---

def create_access_token(data: dict) -> str:
    """Create a JWT access token with configured expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token with configured expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_google_pending_token(data: dict) -> str:
    """Create a short-lived JWT for pending Google registration (10 min)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    to_encode.update({"exp": expire, "type": "google_pending_registration"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
