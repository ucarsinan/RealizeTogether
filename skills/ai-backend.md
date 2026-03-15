# Skill: AI Backend (FastAPI)
# Realize Together — Lade diesen Skill nur bei KI/FastAPI-Aufgaben

## Architektur

```
Next.js (Vercel) → FastAPI (Railway) → OpenAI gpt-4o-mini
```

FastAPI ist NUR für KI + Matching. Kein CRUD über FastAPI.

## Endpoints

```
POST /ai/suggest-skills
  Input:  { bio: string }
  Output: { role: string, skills: string[] }
  Modell: gpt-4o-mini, temperature: 0.3

POST /ai/improve-project
  Input:  { keywords: string }
  Output: { title: string, logline: string, description: string }
  Modell: gpt-4o-mini, temperature: 0.7

GET /
  Output: { status: "ok", service: "Realize Together AI" }
```

## CORS

```python
origins = [
  "http://localhost:3000",
  "https://realize-together.vercel.app"
]
```

## Frontend Integration

```typescript
// src/lib/api.ts
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL

export async function suggestSkills(bio: string) {
  const res = await fetch(`${AI_API_URL}/ai/suggest-skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio })
  })
  return res.json()
}
```

## Environment Variables

```
# .env.local
NEXT_PUBLIC_AI_API_URL=https://realize-together-api.up.railway.app

# Railway
OPENAI_API_KEY=sk-...
```

## Deployment

```bash
# Repository: realize-together-api (separates Repo)
# Platform: Railway → New Project → Deploy from GitHub
# Files: main.py, requirements.txt
```
