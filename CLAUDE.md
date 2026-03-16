# Realize Together – CLAUDE.md

> ⚠️ IMMER ZUERST: Jeden Prompt nach `skills/prompt-engineer.md` bewerten.
> Score < 7/10 → verbesserten Prompt zeigen und auf Bestätigung warten.
> Erst dann Code schreiben.

---

## Was ist Realize Together?

Kollaborationsplattform für Film/Kreative: Talente finden sich, bauen Vertrauen auf (Trust Funnel), arbeiten zusammen.

---

## 🚦 ROUTER

| Prompt verbessern / unsicher über Formulierung | `skills/prompt-engineer.md` |
| Aufgabe | Lies zusätzlich |
|---|---|
| Auth / Login / Register / Middleware | Abschnitt: Auth |
| Profil, Avatar, Video, Verifikation | `skills/storage.md` · `src/actions/profile.actions.ts` |
| Projekt erstellen / bearbeiten | `skills/trust-funnel.md` · `src/actions/project.actions.ts` |
| NDA / Synopsis / synopses-Bucket | `skills/trust-funnel.md` · `src/actions/nda.actions.ts` |
| Bewerbung / Application Flow | `src/actions/application.actions.ts` |
| Messaging / Chat / Realtime | `src/actions/conversation.actions.ts` |
| Match / Double Opt-in | `src/actions/match.actions.ts` |
| Datenbankschema / Typen | `skills/database.md` · `src/lib/types/index.ts` |
| KI / FastAPI | `skills/ai-backend.md` |
| UI-Komponente ohne DB | Nur: Coding Standards unten |
| Neues Feature (unklar) | `AGENTS.md` lesen + alle relevanten Skills |

---

## Tech Stack

```
Frontend:  Next.js 16 (App Router) · TypeScript · Tailwind · shadcn/ui
DB:        Supabase (Postgres + Auth + Storage + Realtime)
KI/Heavy:  FastAPI (Python) – nur KI + Matching, nicht CRUD
```

**Architektur-Regel:** Server Actions → Supabase direkt. Kein API-Layer für CRUD.

---

## Auth

- Supabase Auth (Email + Password)
- `src/lib/supabase/middleware.ts` → Session-Refresh
- `src/middleware.ts` → Route Protection: alles unter `(main)/` braucht Auth
- Callback: `src/app/auth/callback/route.ts`
- Nach Login redirect → `/dashboard`
- Landing Page `/` ist public — kein Redirect

---

## Coding Standards

**Immer:**
- `"use server"` explizit in jeder Action-Datei
- Server Component by default — `"use client"` nur wenn nötig
- Fehler: nie silent catch → immer `ActionResult<T>` zurückgeben
- Typen aus `src/lib/types/index.ts` verwenden
- RLS bedenken: Wer darf lesen/schreiben?
- Jeder neue Code braucht sofort einen Test (`tests/unit/` oder `tests/e2e/`)

**Antwort-Reihenfolge:**
1. Welche Datei(en) werden geändert?
2. Warum (1 Satz)
3. Code

**Nicht hinterfragen:**
- `role_id` NULLABLE in `project_applications`
- `synopsis_url` durch Storage RLS geschützt (nicht App-Logik)
- Drehbuch nicht in DB
- Verifikation MVP: nur Portfolio-Links