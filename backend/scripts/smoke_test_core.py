import os
import sys
import asyncio
import argparse

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.models.user import User # to check import and model health

def print_status(component: str, passed: bool, message: str = ""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {component}{' - ' + message if message else ''}")

async def run_smoke_tests(with_ai: bool = False):
    print("========================================")
    print("Smart Wardrobe AI — Smoke Tests")
    print("========================================\n")
    
    issues = 0

    # 1. Configuration Sanity
    print("--- 1. Configuration Sanity ---")
    
    try:
        if not settings.DATABASE_URL:
            raise ValueError("DATABASE_URL is empty")
        if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 8:
            raise ValueError("SECRET_KEY is missing or too short")
            
        print_status("Environment Config", True)
    except Exception as e:
        print_status("Environment Config", False, str(e))
        issues += 1

    # 2. Database Connection
    print("\n--- 2. Database Connection ---")
    engine = None
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            # simple ping
            pass
        print_status("Database Connection", True)
    except Exception as e:
        print_status("Database Connection", False, str(e))
        issues += 1
    finally:
        if engine:
            await engine.dispose()

    # 3. Core Imports
    print("\n--- 3. Core Modules & Imports ---")
    try:
        from app.services.ai_plan_quota_policy_service import get_user_quota_policy
        from app.services.ai_usage_quota_service import check_quota
        from app.api.dependencies import get_current_user, get_admin_user
        print_status("Core Imports", True)
    except ImportError as e:
        print_status("Core Imports", False, str(e))
        issues += 1

    # 4. Third-Party Integrations
    print("\n--- 4. Third-Party API Readiness ---")
    if settings.GEMINI_API_KEY:
        print_status("Gemini API Key", True, "Present")
    else:
        print_status("Gemini API Key", False, "Missing")
        issues += 1

    if settings.OPENWEATHER_API_KEY:
        print_status("OpenWeather API Key", True, "Present")
    else:
        print_status("OpenWeather API Key", False, "Missing")
        # non-fatal for core, but noted
        
    # 5. AI Execution (Optional)
    if with_ai:
        print("\n--- 5. AI Execution Test ---")
        try:
            from app.services.ai.gemini_provider import gemini_provider
            if not gemini_provider.client:
                raise ValueError("Gemini client not initialized")
            print_status("AI Provider Module", True, "Successfully loaded gemini_provider")
        except Exception as e:
            print_status("AI Provider Module", False, str(e))
            issues += 1

    print("\n========================================")
    if issues > 0:
        print(f"Smoke tests FAILED with {issues} critical issues.")
        sys.exit(1)
    else:
        print("Smoke tests PASSED successfully.")
        sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--with-ai", action="store_true", help="Run active AI provider tests")
    args = parser.parse_args()
    
    asyncio.run(run_smoke_tests(with_ai=args.with_ai))
