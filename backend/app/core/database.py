"""
Database connection and session management.

Uses SQLAlchemy 2.x async engine with PostgreSQL.
Provides async session factory for dependency injection.
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# Async engine — pool settings suitable for MVP
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that provides a database session.

    Yields an async session and ensures it is closed after use.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
