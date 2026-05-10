# PROJECT.md — Permanent Project Context

> This file describes stable, long-lived project facts.
> Update it when the stack, architecture, or conventions change.
> Do NOT use it for current working state — use `CURRENT.md` for that.

---

## Project Overview

**Name:** RealizeTogether / Realize Together
**Purpose:** Kollaborationsplattform für Film/Kreative — Talente finden sich, bauen Vertrauen auf (Trust Funnel), arbeiten zusammen.
**Status:** active / development
**Primary users:** Film and creative professionals seeking collaborators
**Repository:** github.com/[repo]/realize-together (TODO: confirm exact)
**Live URL:** realize-together.vercel.app
**Supabase project ID:** dsmzvqaevqbygefuqeno

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript | |
| Framework | Next.js 16 | App Router, Server Components by default |
| Styling | Tailwind CSS | |
| UI Components | shadcn/ui | |
| Database | Supabase (PostgreSQL) | Supabase Auth + Storage + Realtime |
| ORM / Query | Supabase JS client | Direct from Server Actions |
| Auth | Supabase Auth | Email + Password |
| Storage | Supabase Storage | Avatars, videos, NDAs, synopses |
| AI / Heavy | FastAPI (Python) | Only AI + Matching; NOT used for CRUD |
| Hosting | Vercel | |
| CI/CD | GitHub Actions | tsc → lint → vitest → playwright |

---

## Package Manager & Tooling

| Tool | Command | Notes |
|---|---|---|
| Package manager | npm | |
| Dev server | `npm run dev` | Next.js |
| Tests (unit) | `npm run test:unit` | Vitest — 18 tests |
| Tests (E2E) | `npm run test:e2e` | Playwright — 14+ tests |
| Test setup | `npm run test:setup` | Sets up test users |
| Type check | `npx tsc --noEmit` (or via CI) | |
| Lint | `npm run lint` | ESLint |
| Format | `npm run format` | Prettier |
| Sync context | `npm run sync` | Updates claude-sync.md |

---

## Repository Structure

```
src/
  app/                    — Next.js App Router pages
    (main)/               — Auth-protected routes
    auth/callback/        — Supabase auth callback
  actions/                — Server Actions (Supabase direct)
    profile.actions.ts    — Profile, avatar, video, verification
    project.actions.ts    — Project CRUD
    nda.actions.ts        — NDA + synopsis flow
    application.actions.ts — Application / apply flow
    conversation.actions.ts — Messaging + realtime
    match.actions.ts      — Matching + double opt-in
  components/             — Shared UI components
  lib/
    supabase/
      middleware.ts       — Session refresh
    types/
      index.ts            — Centralized TypeScript types
  middleware.ts           — Route protection
skills/                   — Agent skill files
  database.md
  trust-funnel.md
  ai-backend.md
  storage.md
  prompt-engineer.md
docs/ai/                  — AI workflow state files (this directory)
scripts/                  — AI session helper scripts
tests/
  unit/                   — Vitest unit tests
  e2e/                    — Playwright E2E tests
```

---

## Architecture Notes

- **Architecture rule:** Server Actions → Supabase directly. NO API layer for CRUD.
- FastAPI is only used for AI and matching — never for standard CRUD operations.
- All routes under `(main)/` require authentication (enforced in `src/middleware.ts`).
- Landing page `/` is public — no redirect.
- After login → redirect to `/dashboard`.
- `role_id` is NULLABLE in `project_applications` — do not change this.
- `synopsis_url` is protected by Storage RLS, not application logic — do not move to app layer.

---

## Coding Conventions

- `"use server"` explicit in every Server Action file
- Server Component by default — `"use client"` only when necessary
- Errors: never silent catch → always return `ActionResult<T>`
- Types from `src/lib/types/index.ts` — do not duplicate type definitions
- RLS: every new table/query must consider row-level security
- Every new code needs a test immediately (`tests/unit/` or `tests/e2e/`)
- Answer format: 1) which files change, 2) why (1 sentence), 3) code

---

## Auth Flow

- Supabase Auth (Email + Password)
- `src/lib/supabase/middleware.ts` — session refresh
- `src/middleware.ts` — route protection (all under `(main)/`)
- Callback: `src/app/auth/callback/route.ts`
- After login → `/dashboard`; landing page `/` is public

---

## Known Constraints & Fragile Areas

- `role_id` NULLABLE in `project_applications` — intentional, do not change
- `synopsis_url` protected by Storage RLS — do not handle in application logic
- Drehbuch (screenplay) not in DB — intentional design decision
- Verifikation MVP: only portfolio links (no document verification)
- `CLAUDE.md` should stay under 100 lines — put extras in skills/
- Skills must be loaded on demand: never all at once

---

## Agent Skills (project-specific)

| Task area | Skill to load |
|---|---|
| Database / Schema / Types | `@skills/database.md` |
| NDA / Synopsis / Storage | `@skills/trust-funnel.md` |
| AI / FastAPI Endpoints | `@skills/ai-backend.md` |
| Storage Buckets / Policies | `@skills/storage.md` |
| Prompt quality | `@skills/prompt-engineer.md` |

**Rule:** Load only the skill relevant to the current task. Never all at once.

---

## Environment Variables (names only)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## External Dependencies & Integrations

| Service | Purpose | Notes |
|---|---|---|
| Supabase | DB, Auth, Storage, Realtime | Project ID: dsmzvqaevqbygefuqeno |
| Vercel | Hosting | realize-together.vercel.app |
| FastAPI (Python) | AI + Matching | Separate service — not for CRUD |
| GitHub Actions | CI | tsc → lint → vitest → playwright |

---

## Last Updated

- Date: 2026-05-10
- Updated by: Claude Code (migration from legacy AGENTS.md + CLAUDE.md)
- Reason: Initial migration into docs/ai/ structure via ai-dev-workflow-template
