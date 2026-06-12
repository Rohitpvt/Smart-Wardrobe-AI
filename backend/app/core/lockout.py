from cachetools import TTLCache

# Cache to store failed login attempts.
# Key: email string, Value: failed attempt count.
# Maxsize: 10000 concurrent emails tracked
# TTL: 15 minutes (900 seconds)
failed_login_cache = TTLCache(maxsize=10000, ttl=900)

MAX_FAILED_ATTEMPTS = 5

def record_failed_attempt(email: str) -> None:
    """Record a failed login attempt for the given email."""
    email_key = email.lower()
    current_fails = failed_login_cache.get(email_key, 0)
    failed_login_cache[email_key] = current_fails + 1

def is_locked_out(email: str) -> bool:
    """Check if the given email is locked out due to too many failed attempts."""
    email_key = email.lower()
    return failed_login_cache.get(email_key, 0) >= MAX_FAILED_ATTEMPTS

def reset_failed_attempts(email: str) -> None:
    """Reset the failed login attempts counter on successful login."""
    email_key = email.lower()
    if email_key in failed_login_cache:
        del failed_login_cache[email_key]
