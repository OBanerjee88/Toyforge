# VastuForge — Vastu Compliant Interior Design Platform

## Stack
- Frontend: Next.js → Vercel
- Backend: FastAPI → Render
- AI: Google Gemini 2.5 Flash

## Deploy
1. Push to GitHub
2. Backend: Render (Python 3, root: backend/)
3. Frontend: Vercel (root: frontend/)

## Env Vars
### Render Backend
- GEMINI_API_KEY
- ALLOWED_ORIGINS=https://vastuforge.vercel.app

### Vercel Frontend
- NEXT_PUBLIC_API_URL=https://vastuforge.onrender.com
