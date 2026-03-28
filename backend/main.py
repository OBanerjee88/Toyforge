"""VastuForge Backend API"""
import json, os, re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import hmac
import hashlib
from query_gate import check_and_increment_query

app = FastAPI(title="VastuForge API", version="2.0.0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_SECRET = os.getenv("RAZORPAY_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")

# SECURITY FIX: Hardcoded Pro plan price (in paise)
PRO_PLAN_PRICE = 19900  # ₹199

GEMINI_MODEL   = "gemini-2.5-flash"
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
LIBRARY_FILE   = Path(__file__).parent / "vastu_library.json"

class ChatRequest(BaseModel):
    message: str
    history: list = []
    user_id: str = None

class CheckRequest(BaseModel):
    description: str
    user_id: str = None

async def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    body = {"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":0.4,"maxOutputTokens":1200}}
    async with httpx.AsyncClient(timeout=30) as c:
        res = await c.post(url, json=body)
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini error: {res.text}")
    return res.json()["candidates"][0]["content"]["parts"][0]["text"]


# ============================================
# PHASE 6 LEVEL 1: Enhanced Session Memory
# ============================================

async def summarize_conversation(history: list) -> str:
    """Summarize long conversations to fit context window while preserving key details"""
    if len(history) <= 12:
        return None
    
    middle = history[3:-6]
    if not middle:
        return None
    
    middle_text = "\n".join([f"{m['role']}: {m['content']}" for m in middle])
    
    summary_prompt = f"""Summarize this conversation excerpt in 2-3 sentences.
Focus on: home details mentioned (type, direction, rooms), specific concerns raised, and advice given.

Conversation:
{middle_text}

Summary:"""
    
    try:
        summary = await call_gemini(summary_prompt)
        return summary.strip()
    except:
        return None


def extract_home_context(history: list) -> dict:
    """Extract known home details from conversation for context"""
    context = {}
    full_text = " ".join([m.get('content', '').lower() for m in history])
    
    # Home type detection
    if any(word in full_text for word in ['flat', 'apartment', '2bhk', '3bhk', '1bhk']):
        context['home_type'] = 'flat/apartment'
    elif any(word in full_text for word in ['house', 'villa', 'bungalow', 'independent']):
        context['home_type'] = 'independent house'
    elif 'plot' in full_text:
        context['home_type'] = 'plot'
    
    # Direction detection
    directions = {
        'north-east': ['north-east', 'northeast', 'ne facing', 'ishaan'],
        'north-west': ['north-west', 'northwest', 'nw facing', 'vayavya'],
        'south-east': ['south-east', 'southeast', 'se facing', 'agneya'],
        'south-west': ['south-west', 'southwest', 'sw facing', 'nairutya'],
        'north': ['north facing', 'north entrance', 'uttar'],
        'south': ['south facing', 'south entrance', 'dakshin'],
        'east': ['east facing', 'east entrance', 'purva', 'poorva'],
        'west': ['west facing', 'west entrance', 'paschim'],
    }
    
    for direction, keywords in directions.items():
        if any(kw in full_text for kw in keywords):
            context['entrance_direction'] = direction
            break
    
    # Room mentions
    rooms_mentioned = []
    room_keywords = ['kitchen', 'bedroom', 'bathroom', 'toilet', 'pooja', 'living', 'dining', 'study', 'balcony']
    for room in room_keywords:
        if room in full_text:
            rooms_mentioned.append(room)
    if rooms_mentioned:
        context['rooms_discussed'] = rooms_mentioned
    
    # City detection
    cities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 
              'pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'indore', 'nagpur', 'gurgaon', 'noida']
    for city in cities:
        if city in full_text:
            context['city'] = city.title()
            break
    
    return context

# ============================================
# END PHASE 6 LEVEL 1 HELPERS
# ============================================


@app.get("/health")
def health(): return {"status":"ok"}

@app.get("/vastu-library")
def vastu_library():
    with open(LIBRARY_FILE) as f: return json.load(f)

@app.get("/vastu-library/{design_id}")
def design_detail(design_id: str):
    with open(LIBRARY_FILE) as f: library = json.load(f)
    design = next((d for d in library if d["id"]==design_id), None)
    if not design: raise HTTPException(status_code=404, detail=f"Design {design_id} not found")
    return design

# ============================================
# PHASE 6 LEVEL 1: Updated /vastu-chat
# ============================================

@app.post("/vastu-chat")
async def vastu_chat(req: ChatRequest):
    # Check query limits
    gate = check_and_increment_query(req.user_id)
    if not gate["allowed"]:
        raise HTTPException(status_code=429, detail={
            "error": "daily_limit_reached", 
            "message": "You've used all 10 free AI queries for today. Upgrade to Pro for unlimited access.", 
            "limit": 10
        })
    
    history = req.history if req.history else []
    
    # LEVEL 1: Smart history management
    summary = None
    context = {}
    
    # Extract home context from full history
    context = extract_home_context(history)
    
    # Summarize if conversation is long
    if len(history) > 12:
        summary = await summarize_conversation(history)
        # Keep first 3 (for context) + last 6 (recent) messages
        history = history[:3] + history[-6:]
    
    # Build history text
    history_text = ""
    
    # Add summary if exists
    if summary:
        history_text += f"[Earlier in this conversation: {summary}]\n\n"
    
    # Add extracted context
    if context:
        context_parts = []
        if context.get('home_type'):
            context_parts.append(f"Home: {context['home_type']}")
        if context.get('entrance_direction'):
            context_parts.append(f"Entrance: {context['entrance_direction']}")
        if context.get('city'):
            context_parts.append(f"City: {context['city']}")
        if context.get('rooms_discussed'):
            context_parts.append(f"Rooms discussed: {', '.join(context['rooms_discussed'])}")
        
        if context_parts:
            history_text += f"[Known about user's home: {' | '.join(context_parts)}]\n\n"
    
    # Add recent conversation
    history_text += "".join([f"{h['role'].upper()}: {h['content']}\n" for h in history[-8:]])
    
    prompt = f"""You are VastuAI, a warm and knowledgeable Vastu Shastra consultant for Indian homes.

You have expertise in:
- Vastu principles, directions, and the five elements (Panch Bhuta)
- Room placement, colours, materials, and remedies
- Both traditional practices and practical modern adaptations

Guidelines:
- Be warm, helpful, and use relevant emojis 🪔 🧭 🏠
- Keep responses to 3-5 sentences unless the user asks for detail
- Reference any known context about the user's home
- End with one practical, actionable tip when giving advice

{history_text}USER: {req.message}
VASTUAI:"""
    
    response = await call_gemini(prompt)
    
    return {
        "reply": response.strip(),
        "context_used": context if context else None
    }

# ============================================
# END PHASE 6 LEVEL 1 UPDATES
# ============================================


@app.post("/vastu-check")
async def vastu_check(req: CheckRequest):
    gate = check_and_increment_query(req.user_id)
    if not gate["allowed"]:
        raise HTTPException(status_code=429, detail={"error": "daily_limit_reached", "message": "You've used all 10 free AI queries for today. Upgrade to Pro for unlimited access.", "limit": 10})
    prompt = f"""You are a Vastu compliance expert. Analyze this home and return ONLY valid JSON, no markdown.
Home: {req.description}
Return exactly: {{"overall_score":75,"summary":"Brief 2-sentence assessment","rooms":[{{"room":"Kitchen","direction":"South-East","score":95,"status":"Excellent","tip":"Brief tip"}}],"top_issues":["Issue 1"],"remedies":["Remedy 1","Remedy 2","Remedy 3"],"positive_aspects":["Positive 1"]}}"""
    text = await call_gemini(prompt)
    text = re.sub(r"```json|```","",text).strip()
    try: return json.loads(text)
    except: return {"overall_score":70,"summary":"Analysis complete.","rooms":[],"top_issues":["See full report"],"remedies":["Consult a Vastu expert"],"positive_aspects":["Good Vastu awareness"]}

@app.get("/debug")
async def debug():
    if not GEMINI_API_KEY: return {"error":"GEMINI_API_KEY not set"}
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            res = await c.post(url, json={"contents":[{"parts":[{"text":"Say Namaste"}]}]})
        if res.status_code==200:
            return {"status":"Gemini working!","response":res.json()["candidates"][0]["content"]["parts"][0]["text"]}
        return {"status":"error","code":res.status_code}
    except Exception as e: return {"status":"Exception","error":str(e)}

# New dataset endpoints
RULES_FILE    = Path(__file__).parent / "vastu_rules.json"
REMEDIES_FILE = Path(__file__).parent / "vastu_remedies.json"
PLANS_FILE    = Path(__file__).parent / "floor_plans.json"

@app.get("/vastu-rules")
def vastu_rules_all():
    with open(RULES_FILE) as f: return json.load(f)

@app.get("/vastu-rules/{room_type}")
def vastu_rules_by_room(room_type: str):
    with open(RULES_FILE) as f: rules = json.load(f)
    return [r for r in rules if r["room_type"].lower()==room_type.lower()]

@app.get("/vastu-remedies")
def vastu_remedies_all():
    with open(REMEDIES_FILE) as f: return json.load(f)

@app.get("/floor-plans")
def floor_plans_all():
    try:
        with open(PLANS_FILE) as f: return json.load(f)
    except: return []

class PlanRequest(BaseModel):
    entrance_direction: str
    home_type: str
    num_rooms: int = 3
    special_requirements: str = ""
    user_id: str = None

class OrderRequest(BaseModel):
    user_id: str
    # SECURITY FIX: Remove 'amount' field - we use hardcoded PRO_PLAN_PRICE

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str

@app.post("/generate-plan")
async def generate_plan(req: PlanRequest):
    gate = check_and_increment_query(req.user_id)
    if not gate["allowed"]:
        raise HTTPException(status_code=429, detail={"error": "daily_limit_reached", "message": "You've used all 10 free AI queries for today. Upgrade to Pro for unlimited access.", "limit": 10})
    prompt = f"""You are a Vastu expert. Return ONLY raw JSON, no markdown, no explanation.
Home: {req.home_type}, Entrance: {req.entrance_direction}, Rooms: {req.num_rooms}, Notes: {req.special_requirements or 'None'}
Return this exact JSON:
{{"home_type":"{req.home_type}","entrance_direction":"{req.entrance_direction}","vastu_score":85,"rooms":{{"living_room":"North-East","kitchen":"South-East","master_bedroom":"South-West","bedroom_2":"West","toilet":"North-West","pooja_room":"North-East"}},"key_principles":["Cook facing East","Master bedroom in South-West","Keep North-East open"],"warnings":[],"remedies":["Bright entrance lighting"],"summary":"Vastu compliant layout for your home."}}"""
    try:
        text = await call_gemini(prompt)
        text = re.sub(r"```(?:json)?|```","",text).strip()
        start = text.find('{')
        end = text.rfind('}') + 1
        if start >= 0 and end > start:
            text = text[start:end]
        return json.loads(text)
    except Exception:
        rooms = {"living_room":"North-East","kitchen":"South-East","master_bedroom":"South-West","bedroom_2":"West","toilet":"North-West","pooja_room":"North-East corner"}
        score = 95 if req.entrance_direction in ["North","East","North-East"] else 82 if req.entrance_direction in ["West","South-East","North-West"] else 75
        return {"home_type":req.home_type,"entrance_direction":req.entrance_direction,"vastu_score":score,"rooms":rooms,"key_principles":[f"{req.entrance_direction} entrance — ensure bright lighting and Ganesha above door","Kitchen in South-East (Agni zone) is ideal","Master bedroom in South-West for stability and grounding","Keep North-East corner open and clutter-free"],"warnings":[f"{req.entrance_direction} entrance requires remedies — add Ganesha and bright lights"] if req.entrance_direction in ["South","South-West"] else [],"remedies":["Place Vastu pyramid in defective zones","Sea salt bowls in all corners monthly","Copper vessel in North-East"],"summary":f"Vastu-compliant layout for your {req.home_type} with {req.entrance_direction}-facing entrance. Key rooms placed in ideal directions for harmony and prosperity."}


# ============================================
# SECURITY FIXED: Payment Endpoints
# ============================================

@app.post("/create-order")
async def create_order(req: OrderRequest):
    """
    Create a Razorpay order with HARDCODED price.
    SECURITY: We never trust client-supplied amount.
    """
    try:
        url = "https://api.razorpay.com/v1/orders"
        auth = (RAZORPAY_KEY_ID, RAZORPAY_SECRET)
        
        # SECURITY FIX: Use hardcoded price, not req.amount
        data = {
            "amount": PRO_PLAN_PRICE,  # Always ₹199 (19900 paise)
            "currency": "INR",
            "receipt": f"vf_{req.user_id[:8]}",
            "notes": {
                "user_id": req.user_id, 
                "plan": "pro",
                "expected_amount": PRO_PLAN_PRICE
            }
        }
        
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(url, auth=auth, json=data)
        
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail="Order creation failed")
        
        order = res.json()
        return {
            "id": order["id"], 
            "amount": order["amount"], 
            "currency": order["currency"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/verify-payment")
async def verify_payment(req: VerifyRequest):
    """
    Verify Razorpay payment and upgrade user to Pro.
    SECURITY FIXES:
    1. Verify signature (already done)
    2. Fetch order from Razorpay and verify amount matches expected
    3. Check Supabase write results before returning success
    """
    try:
        headers = {
            "apikey": SUPABASE_SECRET_KEY,
            "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # IDEMPOTENCY CHECK - already processed?
        check_url = f"{SUPABASE_URL}/rest/v1/payment_logs?payment_id=eq.{req.razorpay_payment_id}&select=id"
        with httpx.Client(timeout=10) as client:
            check_res = client.get(check_url, headers=headers)
        
        if check_res.status_code == 200 and check_res.json():
            return {"success": True, "message": "Already processed"}
        
        # VERIFY SIGNATURE
        body = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
        expected_sig = hmac.new(
            RAZORPAY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if expected_sig != req.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # SECURITY FIX: Fetch order from Razorpay to verify actual amount paid
        order_url = f"https://api.razorpay.com/v1/orders/{req.razorpay_order_id}"
        async with httpx.AsyncClient(timeout=10) as client:
            order_res = await client.get(order_url, auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))
        
        if order_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not verify order with Razorpay")
        
        order_data = order_res.json()
        paid_amount = order_data.get("amount_paid", 0)
        
        # Verify amount matches expected Pro price
        if paid_amount < PRO_PLAN_PRICE:
            raise HTTPException(
                status_code=400, 
                detail=f"Payment amount {paid_amount} does not match expected {PRO_PLAN_PRICE}"
            )
        
        # LOG PAYMENT - with error checking
        log_url = f"{SUPABASE_URL}/rest/v1/payment_logs"
        log_data = {
            "payment_id": req.razorpay_payment_id,
            "order_id": req.razorpay_order_id,
            "user_id": str(req.user_id),
            "amount": paid_amount,
            "expected_amount": PRO_PLAN_PRICE,
            "status": "success",
            "verified": True
        }
        
        with httpx.Client(timeout=10) as client:
            log_res = client.post(log_url, headers=headers, json=log_data)
        
        # SECURITY FIX: Check if log insert succeeded
        if log_res.status_code not in [200, 201]:
            raise HTTPException(
                status_code=500, 
                detail="Failed to log payment. Please contact support."
            )
        
        # UPGRADE USER TO PRO - with error checking
        update_url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{req.user_id}"
        with httpx.Client(timeout=10) as client:
            update_res = client.patch(update_url, headers=headers, json={"plan": "pro"})
        
        # SECURITY FIX: Check if upgrade succeeded
        if update_res.status_code not in [200, 204]:
            # Payment logged but upgrade failed - this needs manual intervention
            # Log this error state
            error_log_data = {
                "payment_id": f"ERROR_{req.razorpay_payment_id}",
                "order_id": req.razorpay_order_id,
                "user_id": str(req.user_id),
                "amount": paid_amount,
                "status": "upgrade_failed",
                "verified": True
            }
            with httpx.Client(timeout=10) as client:
                client.post(log_url, headers=headers, json=error_log_data)
            
            raise HTTPException(
                status_code=500, 
                detail="Payment received but upgrade failed. Please contact support with your payment ID."
            )
        
        return {"success": True, "message": "Payment verified, upgraded to Pro"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# END SECURITY FIXES
# ============================================
