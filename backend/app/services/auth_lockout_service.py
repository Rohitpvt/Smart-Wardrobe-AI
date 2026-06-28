import asyncio
import hashlib
import logging
import time
from typing import Dict, Tuple

from app.core.config import settings

logger = logging.getLogger(__name__)

class AuthLockoutService:
    def __init__(self):
        self.max_attempts = 5
        self.lockout_duration = 900  # 15 minutes
        self.use_redis = bool(settings.REDIS_URL)
        
        if self.use_redis:
            import redis.asyncio as redis
            self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            logger.info("[AUTH_LOCKOUT] Initialized with Redis storage")
        else:
            # In-memory fallback
            from cachetools import TTLCache
            # failures: {email_hash: count}
            self.failures_cache = TTLCache(maxsize=10000, ttl=self.lockout_duration)
            # lockouts: {email_hash: True}
            self.lockouts_cache = TTLCache(maxsize=10000, ttl=self.lockout_duration)
            logger.warning("[AUTH_LOCKOUT] Initialized with in-memory fallback (local development only)")

    def _hash_key(self, key: str) -> str:
        return hashlib.sha256(key.encode()).hexdigest()

    async def get_failed_attempts(self, email: str) -> int:
        email_hash = self._hash_key(email)
        if self.use_redis:
            val = await self.redis.get(f"auth:login:failures:{email_hash}")
            return int(val) if val else 0
        else:
            return self.failures_cache.get(email_hash, 0)

    async def record_failed_attempt(self, email: str) -> int:
        email_hash = self._hash_key(email)
        if self.use_redis:
            key = f"auth:login:failures:{email_hash}"
            count = await self.redis.incr(key)
            if count == 1:
                await self.redis.expire(key, self.lockout_duration)
        else:
            count = self.failures_cache.get(email_hash, 0) + 1
            self.failures_cache[email_hash] = count
            
        logger.info(f"[AUTH_LOCKOUT] failed login recorded | email_hash={email_hash} | attempt={count}")
        return count

    async def trigger_lockout(self, email: str):
        email_hash = self._hash_key(email)
        if self.use_redis:
            await self.redis.setex(f"auth:login:lockout:{email_hash}", self.lockout_duration, "1")
        else:
            self.lockouts_cache[email_hash] = True
            
        logger.warning(f"[AUTH_LOCKOUT] account temporarily locked | email_hash={email_hash}")
        
        # Security Hardening Step 2: Safe Email Hook
        # If an existing password reset flow exists, generate a secure token and email it.
        # Otherwise, log an internal stub.
        logger.info(f"[AUTH_LOCKOUT_EMAIL_HOOK] Mock email sent to account owner about lockout. "
                    f"To implement secure reset links, integrate with password reset flow.")

    async def is_locked_out(self, email: str) -> bool:
        email_hash = self._hash_key(email)
        if self.use_redis:
            is_locked = await self.redis.get(f"auth:login:lockout:{email_hash}")
            if is_locked:
                logger.warning(f"[AUTH_LOCKOUT] login blocked by lockout | email_hash={email_hash}")
                return True
        else:
            if email_hash in self.lockouts_cache:
                logger.warning(f"[AUTH_LOCKOUT] login blocked by lockout | email_hash={email_hash}")
                return True
        return False

    async def clear_failures(self, email: str):
        email_hash = self._hash_key(email)
        if self.use_redis:
            await self.redis.delete(f"auth:login:failures:{email_hash}")
            await self.redis.delete(f"auth:login:lockout:{email_hash}")
        else:
            self.failures_cache.pop(email_hash, None)
            self.lockouts_cache.pop(email_hash, None)

    def calculate_progressive_delay(self, attempt_count: int) -> float:
        """
        attempt 1: 0s
        attempt 2: 1s
        attempt 3: 2s
        attempt 4: 4s
        attempt 5: 5s (max cap)
        """
        if attempt_count <= 1:
            return 0.0
        elif attempt_count == 2:
            return 1.0
        elif attempt_count == 3:
            return 2.0
        elif attempt_count == 4:
            return 4.0
        else:
            return 5.0

auth_lockout_service = AuthLockoutService()
