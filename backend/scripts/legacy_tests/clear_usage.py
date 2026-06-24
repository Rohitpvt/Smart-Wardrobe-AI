import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from app.core.config import settings
from app.models.user import User
from app.models.ai_usage import AIUsageEvent

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    S = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with S() as session:
        u = (await session.execute(select(User).where(User.email == "test_feedback_user@example.com"))).scalar_one_or_none()
        if u:
            evts = (await session.execute(select(AIUsageEvent).where(AIUsageEvent.user_id == u.id))).scalars().all()
            print(f"Events to delete: {len(evts)}")
            for e in evts:
                await session.delete(e)
            await session.commit()
            print("Cleared usage events.")
        else:
            print("User not found.")
    await engine.dispose()

asyncio.run(main())
