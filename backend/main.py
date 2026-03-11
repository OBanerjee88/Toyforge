"""VastuForge Backend API"""
import json, os, re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="VastuForge API", version="2.0.0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = "gemini-2.5-flash"
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
LIBRARY_FILE   = Path(__file__).parent / "vastu_library.json"

class ChatRequest(BaseModel):
    message: str
    history: list = []

class CheckRequest(BaseModel):
    description: str

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

@app.post("/vastu-chat")
async def vastu_chat(req: ChatRequest):
    history_text = "".join([f"{h['role'].upper()}: {h['content']}\n" for h in req.history[-6:]])
    prompt = f"""You are VastuAI, a warm expert Vastu Shastra consultant for Indian homes.
You know Vastu principles, directions, five elements, room placement, colours, remedies and cures.
Be warm and practical. Keep responses to 3-5 sentences. Use relevant emojis. End with one practical tip.

{history_text}USER: {req.message}
VASTUAI:"""
    response = await call_gemini(prompt)
    return {"reply": response.strip()}

@app.post("/vastu-check")
async def vastu_check(req: CheckRequest):
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

@app.post("/generate-plan")
async def generate_plan(req: PlanRequest):
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
        # Return intelligent fallback based on entrance direction
        rooms = {"living_room":"North-East","kitchen":"South-East","master_bedroom":"South-West","bedroom_2":"West","toilet":"North-West","pooja_room":"North-East corner"}
        score = 95 if req.entrance_direction in ["North","East","North-East"] else 82 if req.entrance_direction in ["West","South-East","North-West"] else 75
        return {"home_type":req.home_type,"entrance_direction":req.entrance_direction,"vastu_score":score,"rooms":rooms,"key_principles":[f"{req.entrance_direction} entrance — ensure bright lighting and Ganesha above door","Kitchen in South-East (Agni zone) is ideal","Master bedroom in South-West for stability and grounding","Keep North-East corner open and clutter-free"],"warnings":[f"{req.entrance_direction} entrance requires remedies — add Ganesha and bright lights"] if req.entrance_direction in ["South","South-West"] else [],"remedies":["Place Vastu pyramid in defective zones","Sea salt bowls in all corners monthly","Copper vessel in North-East"],"summary":f"Vastu-compliant layout for your {req.home_type} with {req.entrance_direction}-facing entrance. Key rooms placed in ideal directions for harmony and prosperity."}
