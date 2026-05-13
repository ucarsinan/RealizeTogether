# HANDOFF.md — Agent-to-Agent Handoff

> **This file enables any agent to continue work without chat history.**
> It must be updated at the end of every meaningful AI session.
> The rule: if the next agent cannot understand the situation from this file alone, the handoff is incomplete.

---

## Last Updated

- **Date:** 2026-05-13
- **Updated by:** Claude Code (RealizeTogether session)
- **Handoff to:** unspecified

---

## Short Summary

Active Next.js 16 + Supabase + FastAPI project. E2e test suite expanded from 32 to 58 passing Chromium tests across all pages. Two source fixes committed (`package.json` dynamic port, `ExploreFilters` role input key). All commits pushed to origin/main.

---

## Last Action

Expanded Playwright e2e suite: added `applications-management.spec.ts` (User A creator view), extended `explore`, `dashboard`, `project-detail`, `project-flow`, `apply-flow` specs. Fixed two pre-existing strict-mode locator bugs (`getByText` → `getByRole('heading')`, scoped `main` for navbar/breadcrumb ambiguity). 58/58 tests pass.

---

## Open Items

- [ ] Decision: Realtime Chat — Supabase Realtime vs. current polling (Offene Entscheidung #0 in PRODUCT.md)
- [ ] Next feature TBD by owner

---

## Risks / Attention

- E2e tests only cover Chromium; Firefox/Safari not covered
- `package.json` dev script uses inline Node one-liner for dynamic port — verify on CI if needed

---

## Checks

| Check | Status | Notes |
|---|---|---|
| `npx playwright test` | ✅ 58/58 passed | chromium-anon + chromium-auth + chromium-user-b |
| `npm run lint` | not run this session | — |
| `npx tsc --noEmit` | not run this session | — |

---

## Next Concrete Action

Decide on Realtime Chat (PRODUCT.md §7 Offene Entscheidung #0) or pick next feature from backlog.

---

## Ideal Next Prompt

```
Read docs/ai/HANDOFF.md and PRODUCT.md (§7 Offene Entscheidungen) first.

E2e suite is complete (58 tests, all green). Codebase is clean on main.

Your task: implement the next feature. Start by reading PRODUCT.md §5 (Feature Map)
and §7 (Offene Entscheidungen), then propose what to tackle next.
```
