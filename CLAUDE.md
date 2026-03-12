# Realize Together – CLAUDE.md

Du bist der Entwicklungspartner für **Realize Together**, eine Plattform
die Menschen mit komplementären Fähigkeiten zusammenbringt, um Projekte
gemeinsam zu realisieren. Start-Nische: Film/Kreative.

---

## Tech Stack

| Schicht    | Technologie                                                 |
| ---------- | ----------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Datenbank  | Supabase (Postgres + Auth + Storage + Realtime)             |
| Backend/KI | FastAPI (Python) – nur KI + Heavy Logic                     |
| KI MVP     | OpenAI gpt-4o-mini                                          |
| Deploy     | Vercel (Next.js) + Railway (FastAPI)                        |

**Architektur-Prinzip:**

- `Server Actions` → Supabase direkt (CRUD, kein API Layer)
- `API Calls` → FastAPI (KI, Matching, Background Jobs)

---

## Ordnerstruktur

```
src/
  app/                        ← Next.js App Router
    (auth)/                   ← Route Group: Login, Register
    (main)/                   ← Route Group: Authenticated Pages
      explore/                ← Projekte & Profile entdecken
      projects/
        [id]/                 ← Projektdetail + Trust Funnel
        new/                  ← Projekt erstellen
      profile/
        [username]/           ← Öffentliches Profil
      dashboard/              ← My Projects, Requests, Matches
      messages/               ← Chat
    layout.tsx
    page.tsx                  ← Landing Page
  components/
    ui/                       ← shadcn/ui Komponenten
    projects/                 ← Projekt-spezifische Komponenten
    profile/                  ← Profil-Komponenten
    trust-funnel/             ← NDA Modal, Synopsis Viewer
    chat/                     ← Messaging Komponenten
  lib/
    supabase/
      client.ts               ← Browser Client
      server.ts               ← Server Client (Server Actions)
      middleware.ts           ← Auth Middleware
    types/
      database.types.ts       ← Auto-generiert von Supabase CLI
      index.ts                ← App-eigene Types
    utils.ts
  actions/                    ← Server Actions (Supabase CRUD)
    profile.actions.ts
    project.actions.ts
    application.actions.ts
    nda.actions.ts
    match.actions.ts
```

---

## Datenbankschema (Übersicht)

```
profiles           → Profil, Video, Portfolio-Links, Verifikation
user_skills        → Rolle + Erfahrungslevel (Matching-Basis)
projects           → Kern + Trust Funnel (logline, synopsis_url, requires_nda)
project_roles      → Gesuchte Rollen (eigene Tabelle, nicht text[])
nda_consents       → Consent-Log UNIQUE(project_id, user_id)
project_applications → Flow: pending → in_talks → matched | rejected
                       role_id NULLABLE (frühe Stages)
conversations      → Entsteht bei in_talks
messages           → Chat + read_at
matches            → Double Opt-in: creator_confirmed + applicant_confirmed
```

**ENUMs:**

- `project_stage`: idea | concept | development | ready | production | completed
- `application_status`: pending | in_talks | matched | rejected
- `commitment_type`: hobby | side_project | serious | professional
- `collab_type`: paid | passion | both

---

## Trust Funnel (IMMER beachten)

```
Level 1 – Public:     title, logline, stage, commitment_type, project_roles
Level 2 – NDA:        synopsis_url (Supabase Storage "synopses", private)
                      → Zugriff nur wenn nda_consents Eintrag existiert
Level 3 – High Trust: Volles Drehbuch NICHT in DB → nur im Chat teilen
```

**NDA Flow:** Modal → Checkbox → nda_consents INSERT → synopsis freischalten
**WICHTIG:** Kein sofortiges Bewerbungsformular nach NDA. Nutzer liest erst.

---

## Double Opt-in Match

```
matches.creator_confirmed + matches.applicant_confirmed = beide true
→ matched_at gesetzt → project.status = in_progress
```

Kein asymmetrischer Match möglich.

---

## Supabase Storage Buckets

| Bucket     | Typ         | Zweck                    |
| ---------- | ----------- | ------------------------ |
| `avatars`  | public      | Profilbilder             |
| `videos`   | public      | Vorstellungsvideos       |
| `synopses` | **private** | NDA-geschütztes Material |

Storage Policy für `synopses`:

```sql
EXISTS(SELECT 1 FROM nda_consents
       WHERE project_id = (storage.foldername(name))[1]::uuid
       AND user_id = auth.uid())
```

---

## KI im MVP (nur 2 Features)

```
POST /ai/suggest-skills    → Bio → { role, skills[] }  (JSON-Mode)
POST /ai/improve-project   → Stichworte → Beschreibung
```

Modell: `gpt-4o-mini` | API Key immer aus `.env`

---

## Coding Standards

**TypeScript / Next.js:**

- Server Actions für alle Supabase-CRUD-Operationen
- `"use server"` immer explizit
- Typen aus `lib/types/database.types.ts` verwenden
- Fehler: niemals silent catch, immer Error-State zurückgeben
- Komponenten: Server Component by default, `"use client"` nur wenn nötig

**Python / FastAPI:**

- Type Hints immer (Python 3.10+)
- Pydantic Models für Request/Response
- `async def` in FastAPI konsequent
- `HTTPException` statt silent catch
- API Key aus `.env` via `os.getenv()`

---

## Antwort-Verhalten

1. Architektur-Entscheidung VOR Code
2. Datei-Pfad immer angeben (z.B. `src/actions/nda.actions.ts`)
3. Trust Funnel: NDA-Check prüfen wenn `synopsis_url` betroffen
4. RLS beachten: Wer darf diese Daten lesen/schreiben?
5. Neue Konzepte: 2 Sätze Erklärung vor dem Code

---

## Wichtige Entscheidungen (nicht hinterfragen)

- `role_id` in `project_applications` ist **NULLABLE** (frühe Stages)
- `synopsis_url` durch Storage RLS geschützt, nicht durch App-Logik
- Volles Drehbuch wird **nicht** in der DB gespeichert
- `commitment_type` ist **Pflichtfeld** bei Projekterstellung
- Verifikation im MVP: nur Portfolio-Links (kein Ausweis, DSGVO)
