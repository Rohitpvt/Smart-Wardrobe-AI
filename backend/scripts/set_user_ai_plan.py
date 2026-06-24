import asyncio
import argparse
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User

ALLOWED_PLANS = ["free", "premium", "pro"]

async def main():
    parser = argparse.ArgumentParser(description="Set a user's AI plan.")
    parser.add_argument("--email", required=True, help="Email of the user.")
    parser.add_argument("--plan", required=True, choices=ALLOWED_PLANS, help="The AI plan to set.")
    args = parser.parse_args()

    engine = create_async_engine(settings.DATABASE_URL)
    S = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with S() as session:
        result = await session.execute(select(User).where(User.email == args.email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"Error: User with email '{args.email}' not found.")
            await engine.dispose()
            sys.exit(1)
            
        user.ai_plan = args.plan
        await session.commit()
        print(f"Success: User '{args.email}' plan has been set to '{args.plan}'.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
