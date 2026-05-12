# Dashboard Analytics — Design Spec

**Date:** 2026-05-12
**Status:** Approved
**Scope:** Stat chips integrated into existing dashboard page

---

## Problem

The dashboard currently shows lists (projects, applications, conversations) but no at-a-glance summary. Users must scan three columns to understand their current activity level.

## Solution

A **Stats-Strip** — 5 stat chips in a horizontal row — placed between the "Welcome back" header and the 3-column grid in `src/app/(main)/dashboard/page.tsx`.

---

## Metrics

| # | Label | Perspective | Source |
|---|---|---|---|
| 1 | Open Projects | Creator | `projects.filter(p => p.status === 'open').length` |
| 2 | Applications Received | Creator | new server action: COUNT from `project_applications` WHERE `project_id IN (my project IDs)` |
| 3 | Applied | Talent | `applications.length` |
| 4 | Matches | Talent | `applications.filter(a => a.status === 'matched').length` |
| 5 | Unread | Shared | `conversations.reduce((sum, c) => sum + c.unread_count, 0)` |

Metrics 1, 3, 4, 5 use already-fetched data — zero additional DB queries.
Metric 2 requires one new server action.

---

## Architecture

### New server action

```ts
// src/actions/application.actions.ts (append)
export async function getReceivedApplicationsCount(): Promise<ActionResult<number>>
```

- Fetch the authenticated user's project IDs from `getMyProjects()`
- If no projects → return `{ success: true, data: 0 }`
- COUNT rows in `project_applications` WHERE `project_id IN (ids)`
- RLS already ensures only the creator can read applications for their projects

### Dashboard page changes

`src/app/(main)/dashboard/page.tsx`:

1. Add `getReceivedApplicationsCount()` to the `Promise.all([...])` block
2. Derive the 5 stat values from existing + new data
3. Render `<StatsStrip>` between the header and the 3-column grid

### Component

`StatsStrip` — inline function in `dashboard/page.tsx` (no new file needed at this scale):

```tsx
function StatsStrip({ stats }: { stats: StatItem[] }) { ... }
type StatItem = { value: number; label: string }
```

Each chip:
```
bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4
font-unbounded font-black text-[28px] text-[#1a1918]  ← number
font-sans text-[11px] text-[#6b6762] uppercase tracking-widest  ← label
```

Strip layout: `flex flex-wrap gap-4 mb-8` — wraps naturally on mobile.

---

## Data Flow

```
DashboardPage (Server Component)
  ├── getMyProjects()              → projects[]
  ├── getMyApplications()          → applications[]
  ├── getMyConversations()         → conversations[]
  └── getReceivedApplicationsCount() → number   ← NEW

  Derive stats:
    openProjects       = projects.filter(open).length
    receivedApps       = getReceivedApplicationsCount result
    applied            = applications.length
    matches            = applications.filter(matched).length
    unread             = conversations.reduce(unread_count sum, 0)

  Render:
    <StatsStrip stats={[...]} />
    <3-column grid />
```

---

## Edge Cases

- **New user (no data):** All chips show `0` — valid, not an error state
- **Creator only / Talent only:** Some chips will always be `0` — acceptable; no conditional hiding
- **getReceivedApplicationsCount fails:** Use `0` as fallback; dashboard still loads
- **Unread > 99:** Cap display at `99+` (same convention as existing badge)

---

## Out of Scope

- No percentage change / trends ("up 20% this week")
- No admin analytics (platform-wide stats)
- No separate `/dashboard/analytics` page
- No chart components
- No click-through on chips (they are display-only)

---

## Files Changed

| File | Change |
|---|---|
| `src/actions/application.actions.ts` | Add `getReceivedApplicationsCount()` |
| `src/app/(main)/dashboard/page.tsx` | Add parallel fetch, derive stats, render `<StatsStrip>` |

No new files. No schema changes. No migrations.
