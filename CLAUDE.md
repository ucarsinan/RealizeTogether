# Realize Together – CLAUDE.md

> **Lies diese Datei zuerst – vollständig – dann handle nach dem Router unten.**

---

## Was ist Realize Together?

Kollaborationsplattform: Kreative mit komplementären Talenten finden sich,
bauen Vertrauen auf (Trust Funnel), und arbeiten zusammen.
Start-Nische: Film/Kreative.

---

## 🚦 ROUTER – Lies NUR was du brauchst

Bevor du Code schreibst: Klassifiziere die Aufgabe und lies nur die
angegebenen Abschnitte / Dateien.

| Aufgabe betrifft…                        | Lies zusätzlich                                                    |
| ---------------------------------------- | ------------------------------------------------------------------ |
| **Auth / Login / Register / Middleware** | Abschnitt: Auth                                                    |
| **Profil, Avatar, Video, Verifikation**  | Abschnitt: Storage · `src/actions/profile.actions.ts`              |
| **Projekt erstellen / bearbeiten**       | Abschnitt: Trust Funnel · `src/actions/project.actions.ts`         |
| **NDA / Synopsis / synopses-Bucket**     | Abschnitt: Trust Funnel + Storage · `src/actions/nda.actions.ts`   |
| **Bewerbung / Application Flow**         | Abschnitt: Application Flow · `src/actions/application.actions.ts` |
| **Messaging / Chat / Realtime**          | Abschnitt: Messaging · `src/actions/conversation.actions.ts`       |
| **Match / Double Opt-in**                | Abschnitt: Match · `src/actions/match.actions.ts`                  |
| **Explore / Suche / Filter**             | `src/actions/project.actions.ts`                                   |
| **UI-Komponente ohne DB-Logik**          | Nur: Abschnitt Coding Standards                                    |
| **Typen / Schema ändern**                | `src/lib/types/index.ts` + `src/lib/types/database.types.ts`       |
| **Neues Feature (unklar)**               | Komplette CLAUDE.md + relevante Actions                            |

---

## Tech Stack (immer relevant)

```
Frontend:  Next.js (App Router) · TypeScript · Tailwind · shadcn/ui
DB:        Supabase (Postgres + Auth + Storage + Realtime)
KI/Heavy:  FastAPI (Python) – nur KI + Matching, nicht CRUD
```

**Architektur-Regel:** Server Actions → Supabase direkt. Kein API-Layer für CRUD.

---

## Ordnerstruktur (Übersicht)

```
src/
  actions/          ← Server Actions (eine Datei pro Domain)
  app/
    (auth)/         ← Login, Register
    (main)/         ← Alle authentifizierten Pages
      explore/
      projects/[id]/
      dashboard/
      messages/
  components/
    ui/             ← shadcn/ui
    projects/
    profile/
    trust-funnel/   ← NDAModal, SynopsisViewer
    chat/           ← Messaging-Komponenten
  lib/
    supabase/       ← client.ts · server.ts · middleware.ts
    types/          ← database.types.ts · index.ts
    utils.ts
  middleware.ts
```

---

## Auth

- Supabase Auth (Email + Magic Link)
- `src/lib/supabase/middleware.ts` → Session-Refresh
- `src/middleware.ts` → Route Protection: alles unter `(main)/` braucht Auth
- Callback: `src/app/auth/callback/route.ts`
- Nach Login redirect → `/dashboard`

---

## Datenbankschema (Kurzform)

```
profiles           id, full_name, bio, avatar_url, video_url,
                   portfolio_url, imdb_url, vimeo_url, linkedin_url,
                   is_verified, verification_type

projects           id, creator_id, title, description, logline, category,
                   stage, status, commitment_type, collab_type,
                   synopsis_url, requires_nda

project_roles      id, project_id, role_name, quantity, description

nda_consents       id, project_id, user_id, consented_at
                   UNIQUE(project_id, user_id)

project_applications  id, project_id, role_id (NULLABLE!), applicant_id,
                      status, message
                      UNIQUE NULLS NOT DISTINCT (project_id, role_id, applicant_id)

conversations      id, application_id, project_id

messages           id, conversation_id, sender_id, content, read_at, created_at

matches            id, project_id, user_id, role_id,
                   creator_confirmed, applicant_confirmed, matched_at
                   UNIQUE(project_id, user_id)
```

**ENUMs:**

- `project_stage`: idea | concept | development | ready | production | completed
- `application_status`: pending | in_talks | matched | rejected
- `commitment_type`: hobby | side_project | serious | professional
- `collab_type`: paid | passion | both

---

## Trust Funnel

```
Level 1 – Public:     title, logline, stage, commitment_type, project_roles
Level 2 – NDA:        synopsis_url → nur nach nda_consents Eintrag
                      Bucket "synopses" ist PRIVATE
Level 3 – High Trust: Drehbuch NICHT in DB – nur direkt im Chat
```

**NDA Flow:** Modal → Checkbox → nda_consents INSERT → synopsis freischalten
**Wichtig:** Kein Bewerbungsformular direkt nach NDA. User liest erst Synopsis.

Storage Policy synopses (nicht ändern):

```sql
EXISTS(SELECT 1 FROM nda_consents
       WHERE project_id = (storage.foldername(name))[1]::uuid
       AND user_id = auth.uid())
```

---

## Storage Buckets

| Bucket   | Typ         | Pfad-Muster           |
| -------- | ----------- | --------------------- |
| avatars  | public      | `{user_id}/avatar.*`  |
| videos   | public      | `{user_id}/video.*`   |
| synopses | **private** | `{project_id}/{file}` |

---

## Application Flow

```
pending → [Creator: Accept] → in_talks → Conversation erstellt
       → [Creator: Reject] → rejected

in_talks → [beide: confirmMatch()] → matched → project.status = in_progress
```

- `role_id` in `project_applications` ist **NULLABLE** (frühe Stages)
- Ablehnung immer mit Status-Update – kein Ghosting

---

## Messaging

- Conversation entsteht **nur** durch `acceptApplication()`
- Realtime via Supabase `channel.on('postgres_changes', ...)`
- `read_at` setzen wenn Conversation geöffnet wird
- Signed URLs für synopses: 1 Stunde gültig

---

## Match (Double Opt-in)

```
matches.creator_confirmed = true   (Creator klickt "Confirm")
matches.applicant_confirmed = true (Applicant klickt "Confirm")
→ beide true: matched_at setzen, application → matched, project → in_progress
```

Kein asymmetrischer Match möglich.

---

## KI (FastAPI – nur wenn explizit gefragt)

```
POST /ai/suggest-skills    → Bio → { role, skills[] }
POST /ai/improve-project   → Stichworte → strukturierter Text
Modell: gpt-4o-mini | Key aus .env
```

---

## Coding Standards

**Immer:**

- `"use server"` explizit in jeder Action-Datei
- Server Component by default – `"use client"` nur wenn nötig
- Fehler: nie silent catch → immer `ActionResult<T>` zurückgeben
- Typen aus `src/lib/types/index.ts` verwenden
- RLS bedenken: Wer darf lesen/schreiben?

**Antwort-Reihenfolge:**

1. Welche Datei(en) werden geändert?
2. Warum (1 Satz)
3. Code

**Nicht hinterfragen:**

- `role_id` NULLABLE in `project_applications`
- `synopsis_url` durch Storage RLS geschützt (nicht App-Logik)
- Drehbuch nicht in DB
- `commitment_type` Pflichtfeld
- Verifikation MVP: nur Portfolio-Links (kein Ausweis, DSGVO)
