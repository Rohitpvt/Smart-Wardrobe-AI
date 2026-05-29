from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Create a rate limiter instance
# Note: In a scaled production environment, you should replace the memory storage
# with a Redis-backed storage to persist limits across instances.
limiter = Limiter(key_func=get_remote_address)
