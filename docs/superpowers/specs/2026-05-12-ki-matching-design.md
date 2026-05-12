# KI-Matching / Empfehlungen — Design Spec

**Date:** 2026-05-12
**Status:** Approved
**Scope:** Bidirektionales Matching — Projekt-Empfehlungen für Talente + Talent-Empfehlungen für Creators

---

## Problem

Talente sehen auf der Explore-Seite alle Projekte ungefiltert. Creators sehen im Projekt keine Hinweise, welche Profile zur gesuchten Rolle passen könnten. Beide Seiten müssen aktiv suchen — es gibt keine personalisierte Führung.

## Solution

Multi-Signal Matching via FastAPI: OpenAI Embeddings (Cosine-Similarity) + Metadata-Boost (Category, Commitment-Type, Stage). Empfehlungen erscheinen als optionale Sections in bestehenden Seiten — kein neues Routing.

---

## Architektur-Überblick

```
Embedding-Generierung (fire-and-forget bei Daten-Änderung):
  Next.js Server Action (profile save / role save)
    → POST /ai/generate-embedding
    → FastAPI generiert OpenAI Embedding (text-embedding-3-small, 1536-dim)
    → Next.js speichert Embedding in Supabase

Matching (bei Page-Load):
  Next.js Server Component
    → GET /ai/match-projects?user_id={id}   ← Explore-Seite (Talent)
    → GET /ai/match-talents?project_id={id} ← Projekt-Detailseite (Creator)
    → FastAPI: Embeddings aus Supabase lesen, Score berechnen, Top 5 zurückgeben
    → Next.js rendert Section (nur wenn matches.length > 0)
```

FastAPI braucht Supabase Service Key (bereits in Railway ENV für `/ai/suggest-skills` vorhanden).

**Fallback:** `try/catch` um jeden FastAPI-Fetch — leeres Array bei Fehler, Section wird nicht gerendert, Seite lädt normal.

---

## Datenmodell

### Neue Spalten

```sql
-- pgvector Extension aktivieren
CREATE EXTENSION IF NOT EXISTS vector;

-- Talent-Skills Embedding
ALTER TABLE profiles ADD COLUMN skills_embedding vector(1536);

-- Rollen-Embedding
ALTER TABLE project_roles ADD COLUMN role_embedding vector(1536);
```

Beide Spalten sind nullable — werden erst befüllt wenn der User sein Profil speichert (skills) bzw. wenn eine Rolle gespeichert wird.

### Kein Schema-Breaking

- Keine bestehende Spalte wird geändert
- RLS bleibt unverändert (neue Spalten erben die bestehenden Policies)

---

## Scoring-Formel

```
final_score = embedding_similarity * 0.70
            + category_boost        * 0.15
            + commitment_boost      * 0.10
            + stage_boost           * 0.05
```

| Signal | Berechnung |
|---|---|
| `embedding_similarity` | Cosine-Similarity zwischen `skills_embedding` und `role_embedding` (0.0–1.0) |
| `category_boost` | `+1.0` wenn `project.category` == häufigste Category aus User-Bewerbungen, sonst `0.0` |
| `commitment_boost` | `+1.0` wenn `project.commitment_type` == häufigstes Commitment aus User-Bewerbungen, sonst `0.0` |
| `stage_boost` | `+1.0` wenn `project.stage` == häufigster Stage aus User-Bewerbungen, sonst `0.0` |

**Neue User (keine Bewerbungen):** Boost-Felder fallen auf `0.0`, nur Embedding-Similarity zählt — kein Kaltstart-Problem.

**Rückgabe:** Top 5 Kandidaten, sortiert nach `final_score` absteigend. Kein Score-Display für den User.

---

## FastAPI Endpoints

### `POST /ai/generate-embedding`

```python
# Request:
{ "text": "Director of Photography, color grading, ...", "type": "skills" | "role" }

# Response:
{ "embedding": [0.023, -0.14, ...] }  # 1536-dim float array
```

Modell: `text-embedding-3-small` (günstig, ausreichend für diese Dimension).

---

### `GET /ai/match-projects?user_id={id}`

FastAPI liest:
- `profiles WHERE id = user_id` → `skills_embedding` + vergangene Bewerbungen (für Boost-Berechnung)
- `project_roles WHERE role_embedding IS NOT NULL` + JOIN auf `projects` (für Metadata + Status-Filter: nur `status = 'open'`)

```python
# Response:
{
  "matches": [
    { "project_id": "uuid", "role_id": "uuid", "score": 0.87, "role_name": "Director of Photography" },
    ...
  ]
}
```

Returned leeres Array wenn `skills_embedding IS NULL`.

---

### `GET /ai/match-talents?project_id={id}`

FastAPI liest:
- `project_roles WHERE project_id = {id}` → `role_embedding`-Werte
- `profiles WHERE skills_embedding IS NOT NULL`

Berechnet Score pro Talent × Rolle (bestes Match pro Talent — ein Talent taucht maximal einmal auf).

```python
# Response:
{
  "matches": [
    { "user_id": "uuid", "score": 0.84, "matched_role": "Sound Designer" },
    ...
  ]
}
```

---

## Next.js Integration

### Embedding-Generierung — fire-and-forget

**`src/actions/profile.actions.ts` — `updateProfile()`:**
Nach erfolgreichem Supabase-Update: wenn `skills` im Payload enthalten → `POST /ai/generate-embedding` → `UPDATE profiles SET skills_embedding = $1 WHERE id = $2`. Wrapped in `void (async () => {...})()` (gleiche Konvention wie Email via Resend).

**`src/actions/project.actions.ts` — `createProjectRole()` / `updateProjectRole()`:**
Nach erfolgreichem Rollen-Save: `role_name + ' ' + description` → `POST /ai/generate-embedding` → `UPDATE project_roles SET role_embedding = $1 WHERE id = $2`. Ebenfalls fire-and-forget.

---

### Matching — parallele Fetches

**`src/app/(main)/explore/page.tsx`:**

```ts
const [projectsResult, matchesResult] = await Promise.all([
  getProjects(filters),
  getProjectMatches(user.id),  // neuer Server Action
])
```

Section "Empfohlen für dich" wird nur gerendert wenn `matches.length > 0`.

**`src/app/(main)/projects/[id]/page.tsx`:**

```ts
const [projectResult, talentMatchesResult] = await Promise.all([
  getProject(id),
  getTalentMatches(id),  // neuer Server Action, gibt [] zurück wenn user !== creator
])
```

`getTalentMatches` gibt `user_id + score + matched_role` zurück. Next.js resolved Profil-Daten (Avatar, Name) via separatem Supabase-Query auf `profiles` — FastAPI ist nicht für Profil-Lookup zuständig.

Section "Passende Profile" wird nur gerendert wenn `user.id === project.creator_id && matches.length > 0`.

---

## UI-Komponenten

### Explore — "Empfohlen für dich"

```
EMPFOHLEN FÜR DICH     ← font-unbounded, 10px, uppercase, tracking-[.18em], text-[#e8621a]

[ProjectCard]  [ProjectCard]  [ProjectCard]   ← bestehende Komponente, unverändert
```

Erscheint oberhalb des normalen Explore-Grids. Nutzt die bestehende `ProjectCard`-Komponente ohne Änderungen.

### Projekt-Detailseite — "Passende Profile"

```
PASSENDE PROFILE       ← gleicher Kicker-Stil

[Avatar] Full Name     Match: Director of Photography
[Avatar] Full Name     Match: Sound Designer
```

Inline-Komponente `TalentMatchCard` — Avatar (`<Image>`), Name als Link zu `/profile/[id]`, gematche Rolle als Muted-Text. Nur sichtbar für den Creator des Projekts.

---

## Edge Cases

| Fall | Verhalten |
|---|---|
| `skills_embedding` noch nicht befüllt (neuer User) | `match-projects` gibt `[]` zurück, Section bleibt weg |
| FastAPI nicht erreichbar | `try/catch` → leeres Array, Seite lädt normal |
| Projekt hat keine offenen Rollen mit Embedding | `match-talents` gibt `[]` zurück, Section bleibt weg |
| Talent hat sich bereits beworben | Projekt taucht trotzdem in Empfehlungen auf (kein Filter — Bewerber sieht Status bereits im eigenen Dashboard) |
| Creator besucht fremdes Projekt | `getTalentMatches` prüft `user.id === creator_id`, gibt `[]` zurück |

---

## Out of Scope

- Keine Erklärung warum ein Match empfohlen wird ("weil deine Skills...")
- Kein Score-Display für User
- Keine Click-Tracking / Feedback-Loop (kein "Nicht interessiert"-Button)
- Kein Admin-Dashboard für Matching-Qualität
- Kein Realtime-Update der Empfehlungen

---

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/YYYYMMDD_add_embeddings.sql` | pgvector Extension + 2 neue Spalten |
| `src/actions/profile.actions.ts` | fire-and-forget Embedding-Generierung nach skills-Update |
| `src/actions/project.actions.ts` | fire-and-forget Embedding-Generierung nach Rollen-Save |
| `src/actions/matching.actions.ts` | `getProjectMatches()` + `getTalentMatches()` |
| `src/app/(main)/explore/page.tsx` | paralleler Fetch + "Empfohlen für dich" Section |
| `src/app/(main)/projects/[id]/page.tsx` | paralleler Fetch + "Passende Profile" Section |
| `fastapi/routers/ai.py` | 3 neue Endpoints |
| `fastapi/services/matching.py` | Matching-Logik (Scoring, Supabase-Queries) |

Keine neuen Seiten. Keine Schema-Breaking-Changes.
