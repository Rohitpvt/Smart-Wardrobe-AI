"""
Smart Wardrobe AI — Utility Helper Functions

Common utility functions used across the application.
"""

from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def format_timestamp(dt: datetime) -> str:
    """Format a datetime object to ISO 8601 string."""
    return dt.isoformat()
