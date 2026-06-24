import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def fix():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE alembic_version SET version_num = '16bbe36364a0';"))
    await engine.dispose()
    print("Fixed alembic version")

if __name__ == "__main__":
    asyncio.run(fix())
