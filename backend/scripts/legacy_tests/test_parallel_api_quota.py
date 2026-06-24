import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import settings
from app.models.user import User
from app.core.security import create_access_token

async def get_test_token():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        user = (await db.execute(select(User).where(User.email == "test_feedback_user@example.com"))).scalar_one_or_none()
        if not user:
            print("User test_feedback_user@example.com not found. Create it first.")
            return None
        token = create_access_token({"sub": user.email, "type": "access"})
    await engine.dispose()
    return token

async def fire_request(client, token, i):
    headers = {"Authorization": f"Bearer {token}", "x-csrf-token": "test-csrf"}
    cookies = {"csrf_token": "test-csrf"}
    payload = {"occasion": "CASUAL"}
    response = await client.post("http://localhost:8000/api/recommendations/generate", json=payload, headers=headers, cookies=cookies)
    
    if response.status_code in [200, 201]:
        return {"task": i, "status": "success", "status_code": response.status_code}
    elif response.status_code == 403:
        data = response.json()
        detail = data.get("detail", "")
        if isinstance(detail, dict) and (detail.get("error_code") == "quota_exceeded" or detail.get("action") == "quota_exceeded"):
            return {"task": i, "status": "blocked", "status_code": 403}
        if isinstance(detail, str) and "Quota Exceeded" in detail:
            return {"task": i, "status": "blocked", "status_code": 403}
        return {"task": i, "status": f"other_403: {data}", "status_code": 403}
    else:
        return {"task": i, "status": f"error_{response.status_code}: {response.text}", "status_code": response.status_code}

async def main():
    token = await get_test_token()
    if not token:
        return

    # Delete previous usage events for this user to start clean
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        user = (await db.execute(select(User).where(User.email == "test_feedback_user@example.com"))).scalar_one()
        from app.models.ai_usage import AIUsageEvent
        events = (await db.execute(select(AIUsageEvent).where(AIUsageEvent.user_id == user.id))).scalars().all()
        for e in events:
            await db.delete(e)
        await db.commit()
    await engine.dispose()
    
    print("Firing 5 concurrent API requests to /api/stylist/chat ...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        results = await asyncio.gather(*(fire_request(client, token, i) for i in range(5)))
        
    successes = [r for r in results if r["status"] == "success"]
    blocked = [r for r in results if r["status"] == "blocked"]
    
    print("\nResults:")
    for r in results:
        print(f"Task {r['task']}: {r['status']}")
        
    print(f"\nTotal Success: {len(successes)} (Expected: 2)")
    print(f"Total Blocked: {len(blocked)} (Expected: 3)")
    
    if len(successes) == 2 and len(blocked) == 3:
        print("\n[SUCCESS] API-Level Parallel protection TEST PASSED!")
    else:
        print("\n[FAILURE] API-Level Parallel protection TEST FAILED!")

if __name__ == "__main__":
    asyncio.run(main())
