import asyncio
import os
import sys
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func

# Add backend to path so we can import models
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import settings
from app.models.ai_usage import AIUsageEvent
from app.models.user import User


async def run_audit():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("\n" + "="*50)
        print("👕 SMART WARDROBE AI - USAGE AUDIT REPORT")
        print("="*50)
        
        # 1. Overall System Usage
        stmt_total = select(func.count(AIUsageEvent.id))
        total_events = await session.scalar(stmt_total)
        print(f"\nTotal AI Events Recorded: {total_events}")
        
        if total_events == 0:
            print("\nNo AI usage events found yet. Use the app to generate some data!")
            return

        # 2. Usage by Provider
        print("\n--- Usage By Provider ---")
        stmt_providers = select(AIUsageEvent.provider, func.count(AIUsageEvent.id)).group_by(AIUsageEvent.provider)
        result = await session.execute(stmt_providers)
        for provider, count in result.all():
            print(f"- {provider.upper()}: {count} requests")
            
        # 3. Usage by Feature
        print("\n--- Usage By Feature ---")
        stmt_features = select(AIUsageEvent.feature_name, func.count(AIUsageEvent.id)).group_by(AIUsageEvent.feature_name)
        result = await session.execute(stmt_features)
        for feature, count in result.all():
            print(f"- {feature}: {count} requests")
            
        # 4. Token Consumption
        print("\n--- Token Consumption (Estimated) ---")
        stmt_tokens = select(
            func.sum(AIUsageEvent.input_tokens), 
            func.sum(AIUsageEvent.output_tokens)
        ).where(AIUsageEvent.status.in_(["success", "fallback_success"]))
        
        result = await session.execute(stmt_tokens)
        input_tokens, output_tokens = result.first()
        print(f"- Total Input Tokens: {input_tokens or 0:,}")
        print(f"- Total Output Tokens: {output_tokens or 0:,}")
        
        # 5. Fallback/Error Rates
        print("\n--- Reliability ---")
        stmt_status = select(AIUsageEvent.status, func.count(AIUsageEvent.id)).group_by(AIUsageEvent.status)
        result = await session.execute(stmt_status)
        for status, count in result.all():
            print(f"- {status}: {count}")

    await engine.dispose()
    print("\n" + "="*50)

if __name__ == "__main__":
    asyncio.run(run_audit())
