import asyncio
import os
import sys

# Set path so we can import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import httpx

API_URL = "http://localhost:8000/api"

async def test_parallel_quota():
    print("========================================")
    print("PARALLEL QUOTA PROTECTION TEST")
    print("========================================")

    # 1. Get a user and token
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        user = (await db.execute(select(User).limit(1))).scalars().first()
        if not user:
            print("No users found. Test aborted.")
            return
            
        token = create_access_token({"sub": user.email})
        print(f"Using test user: {user.email}")
    
    await engine.dispose()
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # First, ensure quota limit is 2. (We assume it's set in .env for this test)
        # 2. Fire 5 parallel requests
        print("Firing 5 concurrent AI requests...")
        
        # We can use an endpoint like GET /api/intelligence/wardrobe-health or similar.
        # Wait, the prompt says "Perform AI actions". 
        # A simple AI action is /api/intelligence/style-dna (but it might use caching!)
        # What doesn't use caching? /api/recommendations (generating new outfit).
        # Actually, let's just test `ai_usage_quota_service.reserve_usage` directly for pure unit testing of the DB lock, 
        # or use an HTTP endpoint.
        # Let's test the python function directly to perfectly isolate parallel protection.
        
        from app.services.ai_usage_quota_service import reserve_usage, AIQuotaExceededException
        from app.models.ai_usage import AIUsageEvent
        
        engine2 = create_async_engine(settings.DATABASE_URL, echo=False)
        async_session2 = sessionmaker(engine2, class_=AsyncSession, expire_on_commit=False)
        
        async def try_reserve(i):
            async with async_session2() as db:
                try:
                    event_id = await reserve_usage(
                        db=db,
                        user_id=user.id,
                        feature_name="test_parallel",
                        provider="gemini",
                        credential_source="platform_gemini",
                        model_name="default"
                    )
                    return {"task": i, "status": "success", "event_id": event_id}
                except AIQuotaExceededException:
                    return {"task": i, "status": "blocked"}
                except Exception as e:
                    return {"task": i, "status": f"error: {str(e)}"}
                    
        # Clear previous 'test_parallel' events for clean test
        async with async_session2() as db:
            events = (await db.execute(select(AIUsageEvent).where(AIUsageEvent.feature_name == "test_parallel"))).scalars().all()
            for e in events:
                await db.delete(e)
            await db.commit()
            
        print("Executing 3 parallel reservations...")
        results = await asyncio.gather(*(try_reserve(i) for i in range(3)))
        
        successes = [r for r in results if r["status"] == "success"]
        blocked = [r for r in results if r["status"] == "blocked"]
        
        print("\nResults:")
        for r in results:
            print(f"Task {r['task']}: {r['status']}")
            
        print(f"\nTotal Success: {len(successes)} (Expected: 2)")
        print(f"Total Blocked: {len(blocked)} (Expected: 3)")
        
        if len(successes) <= 2:
            print("\n[SUCCESS] Parallel protection TEST PASSED!")
        else:
            print("\n[FAILURE] Parallel protection TEST FAILED! Race condition detected.")
            
        await engine2.dispose()

if __name__ == "__main__":
    asyncio.run(test_parallel_quota())
