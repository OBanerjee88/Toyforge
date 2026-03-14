import os
from datetime import date
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY")

FREE_DAILY_LIMIT = 10

def get_supabase_admin():
    return create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

def check_and_increment_query(user_id: str) -> dict:
    """
    Returns {"allowed": True} if user can make a query.
    Returns {"allowed": False, "reason": "..."} if blocked.
    Automatically resets count if it's a new day.
    """
    if not user_id:
        # Unauthenticated user — allow but don't track
        return {"allowed": True}

    supabase = get_supabase_admin()
    today = date.today().isoformat()

    # Fetch current profile
    result = supabase.table("profiles").select(
        "plan, daily_queries_used, last_query_date"
    ).eq("id", user_id).single().execute()

    if not result.data:
        return {"allowed": True}  # No profile yet, allow

    profile = result.data
    plan = profile.get("plan", "free")
    queries_used = profile.get("daily_queries_used", 0)
    last_query_date = profile.get("last_query_date", today)

    # Pro users — unlimited
    if plan == "pro":
        # Still increment for analytics
        supabase.table("profiles").update({
            "daily_queries_used": queries_used + 1,
            "last_query_date": today
        }).eq("id", user_id).execute()
        return {"allowed": True, "plan": "pro"}

    # Reset count if it's a new day
    if last_query_date != today:
        queries_used = 0

    # Check limit
    if queries_used >= FREE_DAILY_LIMIT:
        return {
            "allowed": False,
            "reason": "daily_limit_reached",
            "queries_used": queries_used,
            "limit": FREE_DAILY_LIMIT,
            "plan": "free"
        }

    # Increment count
    supabase.table("profiles").update({
        "daily_queries_used": queries_used + 1,
        "last_query_date": today
    }).eq("id", user_id).execute()

    return {
        "allowed": True,
        "queries_used": queries_used + 1,
        "limit": FREE_DAILY_LIMIT,
        "plan": "free"
    }
