# Creator Analytics Section — Design Spec

**Date:** 2026-05-13
**Status:** Approved
**Scope:** New Analytics section below the 3-column grid on the dashboard

---

## Problem

The existing StatsStrip shows 5 global counters (open projects, applications received, applied, matches, unread). Creators have no way to see per-project performance or understand the Trust Funnel conversion: how many users signed the NDA, how many applied, how many converted to a match.

---

## Solution

A new **Creator Analytics** section rendered below the existing Quick Links block in `dashboard/page.tsx`. The section contains:

1. **Global summary chips** — 4 aggregated metrics across all of the creator's projects
2. **Per-project table** — one row per project with funnel metrics and conversion rates

---

## Metrics

### Global (aggregated across all creator projects)

| Chip | Source |
|---|---|
| Total Applications | COUNT `project_applications` WHERE project is mine |
| Total Matches | COUNT `project_applications` WHERE status = `matched` AND project is mine |
| NDA Consents | COUNT `nda_consents` WHERE project is mine |
| Match Rate | `total_matches / total_applications * 100` (null if no applications) |

### Per-project

| Column | Source |
|---|---|
| Project | `projects.title` + link to `/projects/[id]` |
| Status | `projects.status` |
| NDAs | COUNT `nda_consents` WHERE `project_id` |
| Applied | COUNT `project_applications` WHERE `project_id` |
| In Talks | COUNT `project_applications` WHERE `project_id` AND `status = in_talks` |
| Matched | COUNT `project_applications` WHERE `project_id` AND `status = matched` |
| Rejected | COUNT `project_applications` WHERE `project_id` AND `status = rejected` |
| Verified | COUNT `project_applications` WHERE `project_id` AND `profiles.is_verified = true` |
| Match Rate | `matched / applied * 100` — shown as `—` when applied = 0 |

---

## Architecture

### New server action

```ts
// src/actions/analytics.actions.ts  (new file)
export async function getCreatorAnalytics(): Promise<ActionResult<CreatorAnalytics>>
```

**Query strategy — 2 parallel Supabase queries:**

1. `project_applications` for all creator project IDs, joined with `profiles(is_verified)`, selecting `project_id`, `status`, `profiles(is_verified)`
2. `nda_consents` for all creator project IDs, selecting `project_id`

Projects list is fetched first (reusing creator's own `projects` rows already available), then both queries run in `Promise.all`.

No new RLS policies needed — creator already has SELECT on their own applications and nda_consents.

### Types

```ts
// src/actions/analytics.actions.ts

export type ProjectAnalytics = {
  project_id: string
  title: string
  status: string
  nda_consents: number
  applications: {
    total: number
    pending: number
    in_talks: number
    matched: number
    rejected: number
    verified: number
  }
  match_rate: number | null   // matched / total * 100, null when total = 0
}

export type CreatorAnalytics = {
  global: {
    total_applications: number
    total_matches: number
    total_nda_consents: number
    match_rate: number | null
  }
  projects: ProjectAnalytics[]
}
```

### New component

```
src/components/dashboard/AnalyticsSection.tsx
```

- Server Component (no `"use client"`)
- Receives `CreatorAnalytics` as prop
- Renders global chips row + project table
- Hidden entirely if the creator has no projects (`projects.length === 0`)

### Dashboard page changes

`src/app/(main)/dashboard/page.tsx`:

1. Import `getCreatorAnalytics` and `AnalyticsSection`
2. Add `getCreatorAnalytics()` to the existing `Promise.all([...])` block
3. Render `<AnalyticsSection data={analytics} />` after the Quick Links block

---

## UI Layout

### Global chips row

```
[ Total Applications ]  [ Total Matches ]  [ NDA Consents ]  [ Match Rate ]
        23                     3                  8               13%
```

Reuses the existing chip style from `StatsStrip`:
```
bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4
font-unbounded font-black text-[28px] text-[#1a1918]   ← number
font-sans text-[11px] uppercase tracking-widest text-[#6b6762]  ← label
```

Match Rate chip shows `—` when no applications exist.

### Project table

Wrapped in the standard card pattern:
```
bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)]
```

Table columns (desktop): Project · Status · NDAs · Applied · In Talks · Matched · Rejected · Verified · Match Rate

- Project name: `<Link href="/projects/[id]">` with hover orange
- Applied cell: shows `12 (3✓)` format when verified > 0
- Match Rate: percentage string `8%` or `—`
- Status badge: reuses existing `StatusBadge` style inline

Mobile: table scrolls horizontally (`overflow-x-auto`).

### Section header

```html
<p class="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a]">
  CREATOR ANALYTICS
</p>
```

---

## Data Flow

```
DashboardPage (Server Component)
  ├── getMyProjects()                 → projects[]
  ├── getMyApplications()             → applications[]
  ├── getMyConversations()            → conversations[]
  ├── getReceivedApplicationsCount()  → number
  └── getCreatorAnalytics()           → CreatorAnalytics   ← NEW

  Render:
    <StatsStrip />
    <3-column grid />
    <Quick links />
    <AnalyticsSection data={analytics} />   ← NEW
```

---

## Edge Cases

- **No projects:** `<AnalyticsSection>` renders nothing (early return)
- **Projects with zero applications:** All counts = 0, Match Rate = `—`
- **`getCreatorAnalytics` fails:** Dashboard page falls back gracefully — `AnalyticsSection` receives null/undefined and renders nothing
- **Talent-only user (no projects):** Section hidden, no noise

---

## Out of Scope

- No time-based trends or delta comparisons
- No chart components
- No separate `/dashboard/analytics` page
- No admin/platform-wide stats
- No click-through on global chips

---

## Files

| File | Change |
|---|---|
| `src/actions/analytics.actions.ts` | New file — `getCreatorAnalytics()` |
| `src/components/dashboard/AnalyticsSection.tsx` | New file — UI component |
| `src/app/(main)/dashboard/page.tsx` | Add parallel fetch + render `<AnalyticsSection>` |

No schema changes. No migrations. No new RLS policies.
