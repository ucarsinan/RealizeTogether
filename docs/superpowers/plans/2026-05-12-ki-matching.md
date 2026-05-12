# KI-Matching / Empfehlungen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bidirektionales Multi-Signal Matching — Projekt-Empfehlungen für Talente auf der Explore-Seite + Talent-Empfehlungen für Creators auf der Projekt-Detailseite.

**Architecture:** FastAPI orchestriert alles: generiert OpenAI Embeddings (text-embedding-3-small, 1536-dim), speichert sie in Supabase (pgvector), berechnet Cosine-Similarity + Metadata-Boost (category, commitment_type, stage) on-demand. Next.js ruft FastAPI fire-and-forget für Embedding-Generierung und on-demand für Matching auf. Fehler werden immer als leeres Array zurückgegeben — Seiten laden immer.

**Tech Stack:** Next.js 16 App Router (Server Components), TypeScript, Supabase (Postgres + pgvector Extension), FastAPI (Python, Railway, separates Repo), OpenAI text-embedding-3-small, Vitest

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/20260512000000_add_embeddings.sql` | Neu: pgvector Extension + `skills_embedding` auf `profiles` + `role_embedding` auf `project_roles` |
| FastAPI repo `routers/ai.py` | Append: 3 neue Endpoints (`/ai/generate-embedding`, `/ai/match-projects`, `/ai/match-talents`) |
| FastAPI repo `services/matching.py` | Neu: Matching-Logik (Supabase-Queries, Scoring, Cosine-Similarity) |
| FastAPI repo `requirements.txt` | Append: `supabase` + `numpy` |
| `src/actions/matching.actions.ts` | Neu: `getProjectMatches()` + `getTalentMatches()` |
| `src/actions/profile.actions.ts` | Modify: fire-and-forget Embedding-Generierung nach `skills`-Update in `updateProfile()` |
| `src/actions/project.actions.ts` | Modify: fire-and-forget Embedding-Generierung nach Rollen-Insert in `createProject()` |
| `src/app/(main)/explore/page.tsx` | Modify: paralleler `getProjectMatches`-Fetch + "Empfohlen für dich" Section |
| `src/app/(main)/projects/[id]/page.tsx` | Modify: paralleler `getTalentMatches`-Fetch + "Passende Profile" Section |
| `tests/unit/actions/matching.test.ts` | Neu: Unit Tests für `getProjectMatches` + `getTalentMatches` |

---

### Task 1: DB Migration — pgvector Extension + Embedding-Spalten

**Files:**
- Create: `supabase/migrations/20260512000000_add_embeddings.sql`

- [ ] **Step 1: Migration-Datei erstellen**

Erstelle `supabase/migrations/20260512000000_add_embeddings.sql`:

```sql
-- Enable pgvector extension for embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Store talent skill embeddings (text-embedding-3-small = 1536 dimensions)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_embedding vector(1536);

-- Store role embeddings for project roles
ALTER TABLE project_roles ADD COLUMN IF NOT EXISTS role_embedding vector(1536);
```

- [ ] **Step 2: Migration auf Supabase anwenden**

```bash
npx supabase db push
```

Expected: Migration erfolgreich — keine Fehlermeldung.

Falls kein Supabase CLI Setup: Migration direkt in Supabase Dashboard unter SQL Editor ausführen.

- [ ] **Step 3: Supabase TypeScript-Typen neu generieren**

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/lib/types/database.types.ts
```

Expected: `database.types.ts` enthält `skills_embedding` und `role_embedding` als `string | null` (Supabase CLI gibt pgvector-Spalten als `string` aus — das ist korrekt, wir casten manuell beim Schreiben).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260512000000_add_embeddings.sql src/lib/types/database.types.ts
git commit -m "feat(db): add pgvector extension and embedding columns"
```

---

### Task 2: FastAPI Endpoints (in separatem Repo `realize-together-api`)

**Kontext:** Das FastAPI-Backend ist ein separates GitHub-Repo, deployed auf Railway. Die bestehende Datei `routers/ai.py` enthält `/ai/suggest-skills` und `/ai/improve-project`. Füge die neuen Endpoints in dieselbe Datei ein. Umgebungsvariablen `SUPABASE_URL` und `SUPABASE_SERVICE_KEY` müssen in Railway gesetzt sein (neu — noch nicht vorhanden).

**Files:**
- Modify: `routers/ai.py` (separates Repo)
- Create: `services/matching.py` (separates Repo)
- Modify: `requirements.txt` (separates Repo)

- [ ] **Step 1: Dependencies ergänzen**

In `requirements.txt` des FastAPI-Repos ergänzen:

```
supabase>=2.0.0
numpy>=1.26.0
```

Dann lokal installieren:

```bash
pip install supabase numpy
```

- [ ] **Step 2: `services/matching.py` erstellen**

Erstelle `services/matching.py` im FastAPI-Repo:

```python
import os
from collections import Counter
from supabase import create_client, Client
import numpy as np

def get_supabase() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)

def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a, dtype=float)
    vb = np.array(b, dtype=float)
    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(va, vb) / (norm_a * norm_b))

def compute_boost(project: dict, pref_category: str | None, pref_commitment: str | None, pref_stage: str | None) -> float:
    boost = 0.0
    if pref_category and project.get("category") == pref_category:
        boost += 0.15
    if pref_commitment and project.get("commitment_type") == pref_commitment:
        boost += 0.10
    if pref_stage and project.get("stage") == pref_stage:
        boost += 0.05
    return boost

def get_user_preferences(supabase: Client, user_id: str) -> tuple[str | None, str | None, str | None]:
    """Returns (most_common_category, most_common_commitment, most_common_stage) from user's application history."""
    result = (
        supabase
        .from_("project_applications")
        .select("projects(category, commitment_type, stage)")
        .eq("applicant_id", user_id)
        .execute()
    )
    rows = result.data or []
    categories = [r["projects"]["category"] for r in rows if r.get("projects") and r["projects"].get("category")]
    commitments = [r["projects"]["commitment_type"] for r in rows if r.get("projects") and r["projects"].get("commitment_type")]
    stages = [r["projects"]["stage"] for r in rows if r.get("projects") and r["projects"].get("stage")]

    pref_category = Counter(categories).most_common(1)[0][0] if categories else None
    pref_commitment = Counter(commitments).most_common(1)[0][0] if commitments else None
    pref_stage = Counter(stages).most_common(1)[0][0] if stages else None
    return pref_category, pref_commitment, pref_stage

def match_projects_for_user(user_id: str) -> list[dict]:
    supabase = get_supabase()

    # Get user's skills embedding
    profile_result = (
        supabase
        .from_("profiles")
        .select("skills_embedding")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile_result.data or not profile_result.data.get("skills_embedding"):
        return []

    user_embedding = profile_result.data["skills_embedding"]
    pref_category, pref_commitment, pref_stage = get_user_preferences(supabase, user_id)

    # Get all open project roles with embeddings
    roles_result = (
        supabase
        .from_("project_roles")
        .select("id, role_name, role_embedding, project_id, projects(id, category, stage, commitment_type, status)")
        .not_("role_embedding", "is", "null")
        .execute()
    )
    roles = [r for r in (roles_result.data or []) if r.get("projects", {}).get("status") == "open"]

    scored = []
    for role in roles:
        sim = cosine_similarity(user_embedding, role["role_embedding"])
        boost = compute_boost(role["projects"], pref_category, pref_commitment, pref_stage)
        score = sim * 0.70 + boost
        scored.append({
            "project_id": role["project_id"],
            "role_id": role["id"],
            "role_name": role["role_name"],
            "score": round(score, 4),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:5]

def match_talents_for_project(project_id: str) -> list[dict]:
    supabase = get_supabase()

    # Get project roles with embeddings
    roles_result = (
        supabase
        .from_("project_roles")
        .select("id, role_name, role_embedding")
        .eq("project_id", project_id)
        .not_("role_embedding", "is", "null")
        .execute()
    )
    roles = roles_result.data or []
    if not roles:
        return []

    # Get all profiles with embeddings
    profiles_result = (
        supabase
        .from_("profiles")
        .select("id, skills_embedding")
        .not_("skills_embedding", "is", "null")
        .execute()
    )
    profiles = profiles_result.data or []
    if not profiles:
        return []

    # Score each profile against each role, keep best match per profile
    best_per_profile: dict[str, dict] = {}
    for profile in profiles:
        best_score = 0.0
        best_role_name = ""
        for role in roles:
            sim = cosine_similarity(profile["skills_embedding"], role["role_embedding"])
            if sim > best_score:
                best_score = sim
                best_role_name = role["role_name"]
        if best_score > 0:
            best_per_profile[profile["id"]] = {
                "user_id": profile["id"],
                "score": round(best_score, 4),
                "matched_role": best_role_name,
            }

    result = list(best_per_profile.values())
    result.sort(key=lambda x: x["score"], reverse=True)
    return result[:5]
```

- [ ] **Step 3: Neue Endpoints in `routers/ai.py` ergänzen**

Am Ende von `routers/ai.py` anfügen (nach den bestehenden Endpoints):

```python
from pydantic import BaseModel
from openai import AsyncOpenAI
from services.matching import match_projects_for_user, match_talents_for_project

openai_client = AsyncOpenAI()

class EmbeddingRequest(BaseModel):
    text: str
    type: str  # "skills" | "role"

class EmbeddingResponse(BaseModel):
    embedding: list[float]

@router.post("/generate-embedding")
async def generate_embedding(req: EmbeddingRequest) -> EmbeddingResponse:
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=req.text.strip(),
    )
    return EmbeddingResponse(embedding=response.data[0].embedding)

@router.get("/match-projects")
async def match_projects(user_id: str) -> dict:
    try:
        matches = match_projects_for_user(user_id)
        return {"matches": matches}
    except Exception:
        return {"matches": []}

@router.get("/match-talents")
async def match_talents(project_id: str) -> dict:
    try:
        matches = match_talents_for_project(project_id)
        return {"matches": matches}
    except Exception:
        return {"matches": []}
```

- [ ] **Step 4: Umgebungsvariablen in Railway setzen**

In Railway Dashboard → realize-together-api → Variables:

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

(Service Role Key: Supabase Dashboard → Settings → API → `service_role` — nicht der `anon` Key)

- [ ] **Step 5: Lokal testen**

```bash
# FastAPI lokal starten
uvicorn main:app --reload

# Test generate-embedding
curl -X POST http://localhost:8000/ai/generate-embedding \
  -H "Content-Type: application/json" \
  -d '{"text": "Director of Photography, color grading", "type": "skills"}'
# Expected: {"embedding": [0.023, -0.14, ...]} — Array mit 1536 floats

# Test match-projects (user_id muss ein echter User mit skills_embedding in DB sein)
curl "http://localhost:8000/ai/match-projects?user_id=<real-user-id>"
# Expected: {"matches": []} (solange noch keine Embeddings in DB)

# Test match-talents
curl "http://localhost:8000/ai/match-talents?project_id=<real-project-id>"
# Expected: {"matches": []}
```

- [ ] **Step 6: Deployen**

```bash
git add routers/ai.py services/matching.py requirements.txt
git commit -m "feat(ai): add generate-embedding, match-projects, match-talents endpoints"
git push
```

Railway deployed automatisch bei Push auf main.

---

### Task 3: `matching.actions.ts` — Next.js Server Actions

**Files:**
- Create: `src/actions/matching.actions.ts`
- Create: `tests/unit/actions/matching.test.ts`

- [ ] **Step 1: Failing tests schreiben**

Erstelle `tests/unit/actions/matching.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getProjectMatches, getTalentMatches } from '@/actions/matching.actions'
import { createClient } from '@/lib/supabase/server'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeAuthSupabase(userId: string) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }
}

function makeOwnerSupabase(userId: string, creatorId: string) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { creator_id: creatorId }, error: null }),
        }
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'u2', full_name: 'Alice', avatar_url: null }],
            error: null,
          }),
        }
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() }
    }),
  }
}

describe('getProjectMatches', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns matches from FastAPI on success', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        matches: [{ project_id: 'p1', role_id: 'r1', role_name: 'DP', score: 0.87 }],
      }),
    })

    const result = await getProjectMatches('u1')
    expect(result).toEqual({
      success: true,
      data: [{ project_id: 'p1', role_id: 'r1', role_name: 'DP', score: 0.87 }],
    })
  })

  it('returns empty array when FastAPI is unreachable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await getProjectMatches('u1')
    expect(result).toEqual({ success: true, data: [] })
  })

  it('returns empty array when FastAPI returns non-ok', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    const result = await getProjectMatches('u1')
    expect(result).toEqual({ success: true, data: [] })
  })
})

describe('getTalentMatches', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns empty array when caller is not project owner', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'different-user') as never)

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({ success: true, data: [] })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns matches with resolved profile data when caller is owner', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'u1') as never)
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        matches: [{ user_id: 'u2', score: 0.84, matched_role: 'Sound Designer' }],
      }),
    })

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({
      success: true,
      data: [
        {
          user_id: 'u2',
          score: 0.84,
          matched_role: 'Sound Designer',
          profile: { id: 'u2', full_name: 'Alice', avatar_url: null },
        },
      ],
    })
  })

  it('returns empty array when FastAPI is unreachable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'u1') as never)
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({ success: true, data: [] })
  })
})
```

- [ ] **Step 2: Tests laufen lassen und sicherstellen, dass sie fehlschlagen**

```bash
cd /Users/sinanucar/Development/RealizeTogether
npx vitest run tests/unit/actions/matching.test.ts
```

Expected: FAIL — `Cannot find module '@/actions/matching.actions'`

- [ ] **Step 3: `matching.actions.ts` implementieren**

Erstelle `src/actions/matching.actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

const AI_BACKEND_URL = process.env.AI_BACKEND_URL

export type ProjectMatch = {
  project_id: string
  role_id: string
  role_name: string
  score: number
}

export type TalentMatch = {
  user_id: string
  score: number
  matched_role: string
  profile: { id: string; full_name: string; avatar_url: string | null } | null
}

export async function getProjectMatches(userId: string): Promise<ActionResult<ProjectMatch[]>> {
  try {
    const res = await fetch(`${AI_BACKEND_URL}/ai/match-projects?user_id=${userId}`)
    if (!res.ok) return { success: true, data: [] }
    const data = (await res.json()) as { matches: ProjectMatch[] }
    return { success: true, data: data.matches ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

export async function getTalentMatches(projectId: string): Promise<ActionResult<TalentMatch[]>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: true, data: [] }

  const { data: project } = await supabase
    .from('projects')
    .select('creator_id')
    .eq('id', projectId)
    .single()

  if (!project || project.creator_id !== user.id) return { success: true, data: [] }

  try {
    const res = await fetch(`${AI_BACKEND_URL}/ai/match-talents?project_id=${projectId}`)
    if (!res.ok) return { success: true, data: [] }
    const data = (await res.json()) as {
      matches: Array<{ user_id: string; score: number; matched_role: string }>
    }
    const matches = data.matches ?? []
    if (matches.length === 0) return { success: true, data: [] }

    const userIds = matches.map((m) => m.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

    return {
      success: true,
      data: matches.map((m) => ({
        ...m,
        profile: profileMap[m.user_id] ?? null,
      })),
    }
  } catch {
    return { success: true, data: [] }
  }
}
```

- [ ] **Step 4: Tests laufen lassen — alle müssen bestehen**

```bash
npx vitest run tests/unit/actions/matching.test.ts
```

Expected: 7 Tests PASS

- [ ] **Step 5: TypeScript-Check**

```bash
npx tsc --noEmit
```

Expected: keine Fehler

- [ ] **Step 6: Commit**

```bash
git add src/actions/matching.actions.ts tests/unit/actions/matching.test.ts
git commit -m "feat(matching): add getProjectMatches and getTalentMatches server actions"
```

---

### Task 4: Embedding-Hooks in `profile.actions.ts` + `project.actions.ts`

**Files:**
- Modify: `src/actions/profile.actions.ts`
- Modify: `src/actions/project.actions.ts`

**Kontext:** Die Embedding-Generierung ist fire-and-forget — genau wie Email-Versand via Resend in diesem Projekt (ADR-003). Fehler dürfen die Hauptoperation nicht blockieren. Der generierte Embedding-Vektor (Array von 1536 floats) wird direkt mit dem Supabase-Client zurück in die DB geschrieben. TypeScript kennt `skills_embedding` und `role_embedding` als `string | null` (pgvector-Output des Supabase CLI) — beim Schreiben casten wir mit `as unknown`.

- [ ] **Step 1: Embedding-Helper in `profile.actions.ts` hinzufügen**

Öffne `src/actions/profile.actions.ts`. Nach dem letzten Import (Zeile ~5), NICHT am Ende der Datei, füge diese interne Hilfsfunktion ein (direkt vor `getProfile`):

```ts
async function generateAndStoreSkillsEmbedding(userId: string, skills: string[]): Promise<void> {
  const text = skills.join(', ')
  const res = await fetch(`${process.env.AI_BACKEND_URL}/ai/generate-embedding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type: 'skills' }),
  })
  if (!res.ok) return
  const data = (await res.json()) as { embedding: number[] }
  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({ skills_embedding: data.embedding as unknown } as never)
    .eq('id', userId)
}
```

- [ ] **Step 2: Fire-and-forget Aufruf in `updateProfile` hinzufügen**

In `updateProfile()`, direkt nach dem `revalidatePath`-Aufruf (und vor `return { success: true, data }`), einfügen:

```ts
  if (input.skills && input.skills.length > 0) {
    void (async () => {
      await generateAndStoreSkillsEmbedding(user.id, input.skills!)
    })()
  }
```

- [ ] **Step 3: Embedding-Helper in `project.actions.ts` hinzufügen**

Öffne `src/actions/project.actions.ts`. Füge nach den Imports diese interne Hilfsfunktion ein:

```ts
async function generateAndStoreRoleEmbedding(roleId: string, roleText: string): Promise<void> {
  const res = await fetch(`${process.env.AI_BACKEND_URL}/ai/generate-embedding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: roleText, type: 'role' }),
  })
  if (!res.ok) return
  const data = (await res.json()) as { embedding: number[] }
  const supabase = await createClient()
  await supabase
    .from('project_roles')
    .update({ role_embedding: data.embedding as unknown } as never)
    .eq('id', roleId)
}
```

- [ ] **Step 4: Fire-and-forget Aufruf in `createProject` hinzufügen**

In `createProject()`, direkt nach dem `rolesError`-Check (nach `if (rolesData.length > 0) { ... }`), aber noch vor `revalidatePath`, einfügen. Suche die Stelle, an der Rollen erfolgreich in die DB geschrieben wurden. Ersetze den Block:

```ts
    if (rolesData.length > 0) {
      const { error: rolesError } = await supabase.from('project_roles').insert(rolesData)

      if (rolesError) {
        await supabase.from('projects').delete().eq('id', project.id)
        return { success: false, error: rolesError.message }
      }
    }
```

Mit:

```ts
    if (rolesData.length > 0) {
      const { data: insertedRoles, error: rolesError } = await supabase
        .from('project_roles')
        .insert(rolesData)
        .select('id, role_name, description')

      if (rolesError) {
        await supabase.from('projects').delete().eq('id', project.id)
        return { success: false, error: rolesError.message }
      }

      for (const role of insertedRoles ?? []) {
        const roleText = [role.role_name, role.description].filter(Boolean).join(' — ')
        void (async () => {
          await generateAndStoreRoleEmbedding(role.id, roleText)
        })()
      }
    }
```

- [ ] **Step 5: TypeScript-Check**

```bash
npx tsc --noEmit
```

Expected: keine Fehler

- [ ] **Step 6: Alle Unit Tests laufen lassen**

```bash
npx vitest run tests/unit/
```

Expected: alle Tests PASS (kein neuer Test für fire-and-forget nötig — die Logik ist trivial und das Muster ist im Projekt etabliert)

- [ ] **Step 7: Commit**

```bash
git add src/actions/profile.actions.ts src/actions/project.actions.ts
git commit -m "feat(matching): trigger embedding generation on profile skills and role save"
```

---

### Task 5: Explore-Seite — "Empfohlen für dich" Section

**Files:**
- Modify: `src/app/(main)/explore/page.tsx`

**Kontext:** Die Explore-Seite ist eine Server Component. Sie ruft bereits `getProjects()` auf. Wir fügen einen parallelen Fetch von `getProjectMatches()` hinzu und rendern eine neue Section oberhalb des normalen Grids. Die Section erscheint nur wenn `matches.length > 0`. Die bestehende `ProjectCard`-Komponente aus `ExploreResults` wird nicht direkt wiederverwendet — stattdessen rendern wir eine eigene kleinere `RecommendedStrip`-Komponente inline (kein neues File nötig bei dieser Größe).

- [ ] **Step 1: Import und parallelen Fetch hinzufügen**

Öffne `src/app/(main)/explore/page.tsx`.

Ersetze:
```ts
import { Suspense } from 'react'
import { getProjects } from '@/actions/project.actions'
```

Mit:
```ts
import { Suspense } from 'react'
import { getProjects } from '@/actions/project.actions'
import { getProjectMatches, type ProjectMatch } from '@/actions/matching.actions'
import { createClient } from '@/lib/supabase/server'
```

Ersetze innerhalb der `ExplorePage`-Funktion:
```ts
  const result = await getProjects({
    stage: params.stage,
    commitment_type: params.commitment,
    category: params.category,
  })

  const projects = result.success ? result.data : []
```

Mit:
```ts
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [result, matchesResult] = await Promise.all([
    getProjects({
      stage: params.stage,
      commitment_type: params.commitment,
      category: params.category,
    }),
    user ? getProjectMatches(user.id) : Promise.resolve({ success: true as const, data: [] }),
  ])

  const projects = result.success ? result.data : []
  const matches = matchesResult.success ? matchesResult.data : []
```

- [ ] **Step 2: "Empfohlen für dich" Section in JSX einfügen**

Im `return`-Block, direkt vor `<div className="mt-8">` (der ExploreResults-Block), einfügen:

```tsx
        {matches.length > 0 && (
          <div className="mt-8">
            <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-4">
              Empfohlen für dich
            </p>
            <RecommendedProjectStrip matches={matches} allProjects={projects} />
          </div>
        )}
```

- [ ] **Step 3: `RecommendedProjectStrip`-Komponente am Ende der Datei hinzufügen**

Am Ende von `src/app/(main)/explore/page.tsx` anfügen:

```tsx
import type { ProjectWithRoles } from '@/lib/types'
import Link from 'next/link'
import { STAGE_LABELS, COMMITMENT_LABELS } from '@/lib/utils'

function RecommendedProjectStrip({
  matches,
  allProjects,
}: {
  matches: ProjectMatch[]
  allProjects: ProjectWithRoles[]
}) {
  const projectMap = Object.fromEntries(allProjects.map((p) => [p.id, p]))

  return (
    <div className="flex flex-wrap gap-4">
      {matches.map((match) => {
        const project = projectMap[match.project_id]
        if (!project) return null
        return (
          <Link
            key={match.role_id}
            href={`/projects/${project.id}`}
            className="bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4 flex flex-col gap-2 shadow-[0_4px_32px_rgba(0,0,0,0.07)] hover:border-[#e8621a] transition-colors min-w-[220px] max-w-[280px]"
          >
            <span className="font-unbounded font-black text-[15px] leading-tight text-[#1a1918] line-clamp-2">
              {project.title}
            </span>
            <span className="font-sans text-[11px] text-[#e8621a] font-medium">{match.role_name}</span>
            <div className="flex gap-2 flex-wrap">
              <span className="font-sans text-[10px] text-[#6b6762] bg-[#f2f0ed] px-2 py-0.5 rounded-full">
                {STAGE_LABELS[project.stage ?? 'idea']}
              </span>
              <span className="font-sans text-[10px] text-[#6b6762] bg-[#f2f0ed] px-2 py-0.5 rounded-full">
                {COMMITMENT_LABELS[project.commitment_type]}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

**Hinweis:** Die `import`-Statements für `ProjectWithRoles`, `Link`, `STAGE_LABELS`, `COMMITMENT_LABELS` müssen oben in der Datei stehen (nicht am Ende). Verschiebe sie an den Anfang der Datei zu den anderen Imports.

- [ ] **Step 4: TypeScript-Check**

```bash
npx tsc --noEmit
```

Expected: keine Fehler

- [ ] **Step 5: Commit**

```bash
git add src/app/(main)/explore/page.tsx
git commit -m "feat(explore): add recommended projects strip above explore grid"
```

---

### Task 6: Projekt-Detailseite — "Passende Profile" Section

**Files:**
- Modify: `src/app/(main)/projects/[id]/page.tsx`

**Kontext:** Die Seite hat bereits `isOwner` und `user`. Wir fügen einen parallelen Fetch von `getTalentMatches()` hinzu (gibt `[]` zurück wenn nicht Owner) und rendern eine neue Section nach den offenen Rollen — nur sichtbar für den Creator.

- [ ] **Step 1: Import und parallelen Fetch hinzufügen**

Öffne `src/app/(main)/projects/[id]/page.tsx`.

Import hinzufügen (zu den bestehenden Imports):
```ts
import { getTalentMatches, type TalentMatch } from '@/actions/matching.actions'
import Image from 'next/image'
```

Ersetze die `result`-Abfrage:
```ts
  const result = await getProject(id)
  if (!result.success) notFound()
```

Mit:
```ts
  const [result, talentMatchesResult] = await Promise.all([
    getProject(id),
    getTalentMatches(id),
  ])
  if (!result.success) notFound()
```

Nach dem bestehenden `const isOwner = user?.id === project.creator_id` hinzufügen:
```ts
  const talentMatches = talentMatchesResult.success ? talentMatchesResult.data : []
```

- [ ] **Step 2: "Passende Profile" Section in JSX einfügen**

Im JSX, nach dem bestehenden Rollen-Block (suche nach `{/* Rollen */}` oder dem Block der `roles.map(...)` rendert), einfügen:

```tsx
        {/* Talent Matches — nur für Creator */}
        {isOwner && talentMatches.length > 0 && (
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
            <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-6">
              Passende Profile
            </p>
            <TalentMatchList matches={talentMatches} />
          </div>
        )}
```

- [ ] **Step 3: `TalentMatchList`-Komponente am Ende der Datei hinzufügen**

Am Ende von `src/app/(main)/projects/[id]/page.tsx` anfügen:

```tsx
function TalentMatchList({ matches }: { matches: TalentMatch[] }) {
  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => {
        if (!match.profile) return null
        return (
          <Link
            key={match.user_id}
            href={`/profile/${match.user_id}`}
            className="flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#f2f0ed] border border-[#e0ddd8] overflow-hidden flex-shrink-0">
              {match.profile.avatar_url ? (
                <Image
                  src={match.profile.avatar_url}
                  alt={match.profile.full_name ?? ''}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#6b6762]" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-medium text-[14px] text-[#1a1918] group-hover:text-[#e8621a] transition-colors">
                {match.profile.full_name}
              </span>
              <span className="font-sans text-[11px] text-[#6b6762]">
                Match: {match.matched_role}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

**Hinweis:** `Link` und `UserCircle` sind bereits in der Datei importiert. `Image` und `TalentMatch` wurden in Step 1 hinzugefügt.

- [ ] **Step 4: TypeScript-Check**

```bash
npx tsc --noEmit
```

Expected: keine Fehler

- [ ] **Step 5: Alle Unit Tests laufen lassen**

```bash
npx vitest run tests/unit/
```

Expected: alle Tests PASS

- [ ] **Step 6: Visual Check**

```bash
npm run dev
```

1. Als Talent: `/explore` öffnen — Section "Empfohlen für dich" erscheint **nicht** (noch keine Embeddings in DB — das ist korrekt).
2. Profil mit Skills speichern → FastAPI wird aufgerufen → `profiles.skills_embedding` wird befüllt.
3. Neues Projekt mit Rollen erstellen → `project_roles.role_embedding` wird befüllt.
4. `/explore` erneut öffnen — Empfehlungen erscheinen.
5. Als Creator auf `/projects/[id]` — Section "Passende Profile" erscheint wenn Embeddings vorhanden.
6. Als Talent auf fremdem `/projects/[id]` — Section erscheint **nicht**.

- [ ] **Step 7: Commit**

```bash
git add src/app/(main)/projects/[id]/page.tsx src/app/(main)/explore/page.tsx
git commit -m "feat(matching): add recommended sections to explore and project detail pages"
```

---

## Done Criteria

- [ ] `supabase/migrations/20260512000000_add_embeddings.sql` ist applied — `skills_embedding` und `role_embedding` existieren in der DB
- [ ] FastAPI hat 3 neue Endpoints: `/ai/generate-embedding`, `/ai/match-projects`, `/ai/match-talents`
- [ ] `getProjectMatches` und `getTalentMatches` sind in `matching.actions.ts` exportiert mit 7 passing Unit Tests
- [ ] Embedding wird fire-and-forget in `updateProfile()` und `createProject()` ausgelöst
- [ ] Explore-Seite zeigt "Empfohlen für dich" Section wenn Matches vorhanden
- [ ] Projekt-Detailseite zeigt "Passende Profile" Section nur für Creator, nur wenn Matches vorhanden
- [ ] `npx tsc --noEmit` ohne Fehler
- [ ] `npx vitest run tests/unit/` alle Tests PASS
