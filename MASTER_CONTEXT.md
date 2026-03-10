# VastuForge — Master Development Context

## Platform Overview
AI Vastu Advisor + Interior Design Platform for Indian homes.

### Core Capabilities
1. **AI Vastu Advisor** — Users describe home in natural language → AI checks layout against Vastu rules → suggests remedies
2. **Interior Design Generator** — Room type + direction + style + budget → color palette, furniture, decor, lighting, Vastu explanation
3. **Home Planning Assistant** — Plot direction + size + rooms → recommended placements + Vastu score + layout suggestions

### Tech Stack
- Frontend: Next.js → Vercel (https://toyforge.vercel.app)
- Backend: FastAPI → Render (https://toyforge.onrender.com)
- AI: Google Gemini 2.5 Flash (free tier)
- Data: JSON files (no paid DB)

---

## Knowledge Graph Entities
- Home → Room → Direction → Rule → Remedy → Moodboard → Interior Style

## AI Reasoning Pipeline
User input → layout parser → rule evaluation → violation detection → remedy retrieval → design recommendation

---

## Dataset Schemas

### DATASET 1: Vastu Rules
```json
{
  "room_type": "",
  "ideal_direction": [],
  "acceptable_direction": [],
  "avoid_direction": [],
  "recommended_colors": [],
  "recommended_materials": [],
  "recommended_elements": [],
  "notes": "",
  "source_reference": ""
}
```

### DATASET 2: Vastu Remedies
```json
{
  "problem": "",
  "room_type": "",
  "direction": "",
  "severity": "High|Medium|Low",
  "remedies": [],
  "decor_adjustments": [],
  "lighting_suggestions": [],
  "notes": "",
  "source_reference": ""
}
```

### DATASET 3: Floor Plan Layouts
```json
{
  "home_type": "",
  "entrance_direction": "",
  "rooms": {},
  "vastu_score": 0,
  "notes": ""
}
```

### DATASET 4: Interior Moodboards
```json
{
  "room_type": "",
  "direction": "",
  "style": "",
  "color_palette": [],
  "materials": [],
  "furniture_elements": [],
  "decor_elements": [],
  "lighting_style": "",
  "vastu_considerations": "",
  "source_type": ""
}
```

---

## Data Sources (Legal Only)
✅ Public domain texts (Mayamata, Manasara, Brihat Samhita)
✅ Creative Commons images
✅ User-submitted designs
✅ Widely known architectural/Vastu principles
❌ No proprietary content from paid sites
❌ No scraping copyrighted platforms

---

## Dataset Expansion Targets
- Vastu rules: 500+
- Remedies: 500+
- Floor plans: 10,000+
- Moodboards: 50,000+

---

## Current Status
- ✅ 70 Vastu designs (vastu_library.json)
- ✅ AI Vastu Chat (/advisor)
- ✅ Vastu Compliance Checker (/checker)
- ✅ Design Library with filters (/library)
- 🔧 Expanding datasets
- 🔧 Adding floor plan library
- 🔧 Adding interior moodboard generator

---

## Legal Note
All data stored as metadata + structured info + links to original sources.
No reproduction of copyrighted visual content.
