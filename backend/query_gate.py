"""
VastuForge Query Gate - Freemium limiter
Checks and increments daily query count via Supabase REST API
"""
import os
import httpx
from datetime import datetime, date

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")

FREE_DAILY_LIMIT = 10


def check_and_increment_query(user_id: str) -> dict:
    """
    Check if user can make a query and increment their counter.
    Returns {"allowed": True/False, "queries_used": N, "limit": 10}
    """
    
    # If no user_id, allow but don't track (anonymous user)
    if not user_id:
        return {"allowed": True, "queries_used": 0, "limit": FREE_DAILY_LIMIT}
    
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        # If Supabase not configured, fail CLOSED (deny) for safety
        # Change to True only for development
        return {"allowed": False, "queries_used": 0, "limit": FREE_DAILY_LIMIT, "error": "Database not configured"}
    
    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        # Fetch user profile
        url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=plan,daily_queries_used,last_query_date"
        
        with httpx.Client(timeout=10) as client:
            res = client.get(url, headers=headers)
        
        if res.status_code != 200:
            # Database error - fail CLOSED for safety
            return {"allowed": False, "queries_used": 0, "limit": FREE_DAILY_LIMIT, "error": "Database lookup failed"}
        
        data = res.json()
        
        if not data:
            # User profile doesn't exist - this shouldn't happen if auth is working
            # Allow but log this case
            return {"allowed": True, "queries_used": 0, "limit": FREE_DAILY_LIMIT, "warning": "Profile not found"}
        
        profile = data[0]
        plan = profile.get("plan", "free")
        
        # Pro users get unlimited
        if plan == "pro":
            return {"allowed": True, "queries_used": 0, "limit": "unlimited", "plan": "pro"}
        
        # Free users - check daily limit
        today = date.today().isoformat()
        last_query_date = profile.get("last_query_date", "")
        queries_used = profile.get("daily_queries_used", 0) or 0
        
        # Reset counter if it's a new day
        if last_query_date != today:
            queries_used = 0
        
        # Check if limit reached
        if queries_used >= FREE_DAILY_LIMIT:
            return {
                "allowed": False, 
                "queries_used": queries_used, 
                "limit": FREE_DAILY_LIMIT,
                "plan": "free"
            }
        
        # Increment counter
        new_count = queries_used + 1
        update_url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
        update_data = {
            "daily_queries_used": new_count,
            "last_query_date": today
        }
        
        with httpx.Client(timeout=10) as client:
            update_res = client.patch(update_url, headers=headers, json=update_data)
        
        if update_res.status_code not in [200, 204]:
            # Update failed - still allow this query but log warning
            return {
                "allowed": True, 
                "queries_used": new_count, 
                "limit": FREE_DAILY_LIMIT,
                "warning": "Counter update failed"
            }
        
        return {
            "allowed": True, 
            "queries_used": new_count, 
            "limit": FREE_DAILY_LIMIT,
            "plan": "free"
        }
        
    except Exception as e:
        # On any error, fail CLOSED for safety
        return {"allowed": False, "queries_used": 0, "limit": FREE_DAILY_LIMIT, "error": str(e)}
