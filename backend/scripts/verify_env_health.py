import os
import sys

def mask_secret(secret: str) -> str:
    if not secret:
        return "MISSING"
    if len(secret) <= 8:
        return "***"
    return secret[:4] + "..." + secret[-4:]

def check_env():
    print("========================================")
    print("Environment Health Verification")
    print("========================================\n")
    
    # Load .env explicitly if needed
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    issues = 0
    
    def check_var(name: str, is_secret: bool = False, is_optional: bool = False):
        nonlocal issues
        val = os.getenv(name)
        if not val:
            if is_optional:
                print(f"{name}: not configured (optional)")
            else:
                print(f"{name}: MISSING (Required)")
                issues += 1
            return
        
        if is_secret:
            print(f"{name}: present, masked={mask_secret(val)}")
        else:
            print(f"{name}: present, length={len(val)}")

    print("--- Database ---")
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        host = db_url.split("@")[-1].split("/")[0] if "@" in db_url else "unknown"
        print(f"DATABASE_URL: present, host={host}")
    else:
        print("DATABASE_URL: MISSING")
        issues += 1

    print("\n--- Authentication ---")
    check_var("SECRET_KEY", is_secret=True)
    check_var("GOOGLE_CLIENT_ID", is_optional=True)
    check_var("GOOGLE_CLIENT_SECRET", is_secret=True, is_optional=True)

    print("\n--- AI Providers ---")
    check_var("GEMINI_API_KEY", is_secret=True)
    check_var("NVIDIA_API_KEY", is_secret=True)
    check_var("OPENWEATHER_API_KEY", is_secret=True)

    print("\n--- General Setup ---")
    check_var("FRONTEND_URLS", is_optional=True)
    
    print("\n--- Quotas ---")
    check_var("PLATFORM_AI_QUOTA_ENABLED", is_optional=True)
    check_var("AI_QUOTA_FREE_DAILY_LIMIT", is_optional=True)
    check_var("AI_QUOTA_PREMIUM_DAILY_LIMIT", is_optional=True)
    check_var("AI_QUOTA_PRO_DAILY_LIMIT", is_optional=True)

    print("\n========================================")
    if issues > 0:
        print(f"FAILED: Found {issues} required missing variables.")
        sys.exit(1)
    else:
        print("PASSED: Environment looks healthy.")
        sys.exit(0)

if __name__ == "__main__":
    check_env()
