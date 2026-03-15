import os
import httpx
from datetime import date

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
FREE_DAILY_LIMIT = 10

def get_headers():
    return {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def check_and_increment_query(user_id: str) -> dict:
    if not user_id or not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        return {"allowed": True}

    today = date.today().isoformat()
    headers = get_headers()

    try:
        url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=plan,daily_queries_used,last_query_date"
        with httpx.Client(timeout=10) as client:
            res = client.get(url, headers=headers)

        if res.status_code != 200 or not res.json():
            return {"allowed": True}

        profile = res.json()[0]
        plan = profile.get("plan", "free")
        queries_used = profile.get("daily_queries_used", 0)
        last_query_date = profile.get("last_query_date", today)

        if last_query_date != today:
            queries_used = 0

        if plan == "pro":
            _increment(user_id, queries_used, today, headers)
            return {"allowed": True, "plan": "pro"}

        if queries_used >= FREE_DAILY_LIMIT:
            return {"allowed": False, "reason": "daily_limit_reached", "queries_used": queries_used, "limit": FREE_DAILY_LIMIT, "plan": "free"}

        _increment(user_id, queries_used, today, headers)
        return {"allowed": True, "queries_used": queries_used + 1, "limit": FREE_DAILY_LIMIT, "plan": "free"}

    except Exception as e:
        print(f"Query gate error: {e}")
        return {"allowed": True}

def _increment(user_id: str, current_count: int, today: str, headers: dict):
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
    data = {"daily_queries_used": current_count + 1, "last_query_date": today}
    try:
        with httpx.Client(timeout=10) as client:
            client.patch(url, headers=headers, json=data)
    except Exception as e:
        print(f"Increment error: {e}")
