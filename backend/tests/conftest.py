import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.models.base import Base

# Use the same database but we can just use the standard one for these tests, or an in-memory SQLite if supported.
# Wait, PostgreSQL async features don't map to SQLite perfectly, so we'll just hit the test Neon DB.
# In a real setup we'd use a separate test DB, but for this implementation we'll just hit the dev DB.
engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

@pytest_asyncio.fixture(scope="function")
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

from app.core.rate_limit import limiter

@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset the SlowAPI rate limiter state before each test."""
    limiter.reset()
