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

async def main():
    parser = argparse.ArgumentParser(description="Promote a user to admin.")
    parser.add_argument("--email", required=True, help="Email of the user to promote.")
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
            
        user.is_admin = True
        await session.commit()
        print(f"Success: User '{args.email}' has been promoted to admin.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
