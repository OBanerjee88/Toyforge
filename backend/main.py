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
