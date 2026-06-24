from app.models.user import User
from app.core.config import settings

def get_user_quota_policy(user: User) -> dict:
    """
    Resolves the user's AI quota policy based on their role and ai_plan.
    """
    if user.is_admin:
        return {
            "plan": "admin",
            "effective_plan": "admin",
            "limit_count": None,
            "is_unlimited": True,
            "upgrade_available": False
        }
        
    plan = user.ai_plan if user.ai_plan in ["free", "premium", "pro"] else "free"
    
    # Resolve limits with fallbacks
    if plan == "free":
        limit = settings.AI_QUOTA_FREE_DAILY_LIMIT
        if limit is None:
            limit = settings.PLATFORM_AI_FREE_DAILY_LIMIT
        if limit is None:
            limit = 10
    elif plan == "premium":
        limit = settings.AI_QUOTA_PREMIUM_DAILY_LIMIT
        if limit is None:
            limit = 100
    elif plan == "pro":
        limit = settings.AI_QUOTA_PRO_DAILY_LIMIT
        if limit is None:
            limit = 500
    else:
        limit = 10  # fallback safety
        
    return {
        "plan": user.ai_plan, # Original plan assigned to user
        "effective_plan": plan, # The plan we are enforcing
        "limit_count": limit,
        "is_unlimited": False,
        "upgrade_available": plan != "pro" # If pro, they are at the top tier
    }
