# Creator Analytics Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Creator Analytics section to the dashboard showing global funnel metrics and a per-project breakdown table.

**Architecture:** New `analytics.actions.ts` server action fetches application statuses and NDA consents in two parallel Supabase queries and aggregates them in TypeScript. A new `AnalyticsSection` Server Component renders global chips and a per-project table. The dashboard page adds one parallel fetch and renders the component below the Quick Links block.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + RLS), Tailwind CSS, Vitest (unit), Playwright (E2E)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/actions/analytics.actions.ts` | Create | `getCreatorAnalytics()` — fetch + aggregate analytics data |
| `src/components/dashboard/AnalyticsSection.tsx` | Create | Render global chips row + per-project table |
| `src/app/(main)/dashboard/page.tsx` | Modify | Add parallel fetch + render `<AnalyticsSection>` |
| `tests/unit/actions/analytics.actions.test.ts` | Create | Unit tests for `getCreatorAnalytics` |
| `tests/e2e/dashboard.spec.ts` | Modify | E2E: verify analytics section renders |

---

## Task 1: Server action — types and skeleton

**Files:**
- Create: `src/actions/analytics.actions.ts`

- [ ] **Step 1.1: Create the file with types and a failing stub**

Create `src/actions/analytics.actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

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
  match_rate: number | null
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

export async function getCreatorAnalytics(): Promise<ActionResult<CreatorAnalytics>> {
  throw new Error('not implemented')
}
```

- [ ] **Step 1.2: Commit skeleton**

```bash
git add src/actions/analytics.actions.ts
git commit -m "feat(analytics): add types and stub for getCreatorAnalytics"
```

---

## Task 2: Unit tests for getCreatorAnalytics

**Files:**
- Create: `tests/unit/actions/analytics.actions.test.ts`

- [ ] **Step 2.1: Write failing unit tests**

Create `tests/unit/actions/analytics.actions.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getCreatorAnalytics } from '@/actions/analytics.actions'
import { createClient } from '@/lib/supabase/server'

// Builds a mock Supabase client.
// projects: array of { id, title, status } for the creator
// apps: array of { project_id, status, profiles: { is_verified: boolean } }
// ndas: array of { project_id }
function makeSupabase(
  projects: { id: string; title: string; status: string }[],
  apps: { project_id: string; status: string; profiles: { is_verified: boolean } }[],
  ndas: { project_id: string }[]
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: projects, error: null }),
        }
      }
      if (table === 'project_applications') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: apps, error: null }),
        }
      }
      if (table === 'nda_consents') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: ndas, error: null }),
        }
      }
      return {}
    }),
  }
}

describe('getCreatorAnalytics', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns empty analytics when creator has no projects', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([], [], []) as never)
    const result = await getCreatorAnalytics()
    expect(result).toEqual({
      success: true,
      data: {
        global: { total_applications: 0, total_matches: 0, total_nda_consents: 0, match_rate: null },
        projects: [],
      },
    })
  })

  it('aggregates per-project application counts correctly', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase(
        [{ id: 'p1', title: 'Film A', status: 'open' }],
        [
          { project_id: 'p1', status: 'pending', profiles: { is_verified: false } },
          { project_id: 'p1', status: 'matched', profiles: { is_verified: true } },
          { project_id: 'p1', status: 'rejected', profiles: { is_verified: false } },
        ],
        [{ project_id: 'p1' }, { project_id: 'p1' }]
      ) as never
    )
    const result = await getCreatorAnalytics()
    expect(result.success).toBe(true)
    if (!result.success) return
    const p = result.data.projects[0]
    expect(p.project_id).toBe('p1')
    expect(p.applications.total).toBe(3)
    expect(p.applications.pending).toBe(1)
    expect(p.applications.matched).toBe(1)
    expect(p.applications.rejected).toBe(1)
    expect(p.applications.in_talks).toBe(0)
    expect(p.applications.verified).toBe(1)
    expect(p.nda_consents).toBe(2)
    expect(p.match_rate).toBeCloseTo(33.33, 1)
  })

  it('computes global aggregates across multiple projects', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase(
        [
          { id: 'p1', title: 'Film A', status: 'open' },
          { id: 'p2', title: 'Film B', status: 'open' },
        ],
        [
          { project_id: 'p1', status: 'matched', profiles: { is_verified: true } },
          { project_id: 'p1', status: 'pending', profiles: { is_verified: false } },
          { project_id: 'p2', status: 'matched', profiles: { is_verified: false } },
        ],
        [{ project_id: 'p1' }, { project_id: 'p2' }, { project_id: 'p2' }]
      ) as never
    )
    const result = await getCreatorAnalytics()
    expect(result.success).toBe(true)
    if (!result.success) return
    const g = result.data.global
    expect(g.total_applications).toBe(3)
    expect(g.total_matches).toBe(2)
    expect(g.total_nda_consents).toBe(3)
    expect(g.match_rate).toBeCloseTo(66.67, 1)
  })

  it('sets match_rate to null when no applications exist', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase(
        [{ id: 'p1', title: 'Film A', status: 'open' }],
        [],
        []
      ) as never
    )
    const result = await getCreatorAnalytics()
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.global.match_rate).toBeNull()
    expect(result.data.projects[0].match_rate).toBeNull()
  })

  it('returns error when not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no auth') }),
      },
    } as never)
    const result = await getCreatorAnalytics()
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when projects query fails', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      })),
    } as never)
    const result = await getCreatorAnalytics()
    expect(result).toEqual({ success: false, error: 'DB error' })
  })
})
```

- [ ] **Step 2.2: Run tests to verify they fail**

```bash
npx vitest run tests/unit/actions/analytics.actions.test.ts
```

Expected: all tests FAIL with "not implemented"

- [ ] **Step 2.3: Commit failing tests**

```bash
git add tests/unit/actions/analytics.actions.test.ts
git commit -m "test(analytics): add unit tests for getCreatorAnalytics"
```

---

## Task 3: Implement getCreatorAnalytics

**Files:**
- Modify: `src/actions/analytics.actions.ts`

- [ ] **Step 3.1: Replace stub with full implementation**

Replace the entire content of `src/actions/analytics.actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

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
  match_rate: number | null
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

export async function getCreatorAnalytics(): Promise<ActionResult<CreatorAnalytics>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('creator_id', user.id)

  if (projectsError) return { success: false, error: projectsError.message }
  if (!projects || projects.length === 0) {
    return {
      success: true,
      data: {
        global: { total_applications: 0, total_matches: 0, total_nda_consents: 0, match_rate: null },
        projects: [],
      },
    }
  }

  const projectIds = projects.map((p) => p.id)

  const [appsResult, ndasResult] = await Promise.all([
    supabase
      .from('project_applications')
      .select('project_id, status, profiles(is_verified)')
      .in('project_id', projectIds),
    supabase
      .from('nda_consents')
      .select('project_id')
      .in('project_id', projectIds),
  ])

  const apps = appsResult.data ?? []
  const ndas = ndasResult.data ?? []

  // Count NDAs per project
  const ndaByProject: Record<string, number> = {}
  for (const nda of ndas) {
    ndaByProject[nda.project_id] = (ndaByProject[nda.project_id] ?? 0) + 1
  }

  // Aggregate applications per project
  const appsByProject: Record<
    string,
    { total: number; pending: number; in_talks: number; matched: number; rejected: number; verified: number }
  > = {}

  for (const app of apps) {
    if (!appsByProject[app.project_id]) {
      appsByProject[app.project_id] = { total: 0, pending: 0, in_talks: 0, matched: 0, rejected: 0, verified: 0 }
    }
    const bucket = appsByProject[app.project_id]
    bucket.total++
    const status = app.status as string
    if (status === 'pending') bucket.pending++
    else if (status === 'in_talks') bucket.in_talks++
    else if (status === 'matched') bucket.matched++
    else if (status === 'rejected') bucket.rejected++
    const profile = app.profiles as { is_verified: boolean } | null
    if (profile?.is_verified) bucket.verified++
  }

  const empty = { total: 0, pending: 0, in_talks: 0, matched: 0, rejected: 0, verified: 0 }

  const projectAnalytics: ProjectAnalytics[] = projects.map((p) => {
    const a = appsByProject[p.id] ?? { ...empty }
    return {
      project_id: p.id,
      title: p.title,
      status: p.status,
      nda_consents: ndaByProject[p.id] ?? 0,
      applications: a,
      match_rate: a.total > 0 ? Math.round((a.matched / a.total) * 10000) / 100 : null,
    }
  })

  const totalApplications = projectAnalytics.reduce((s, p) => s + p.applications.total, 0)
  const totalMatches = projectAnalytics.reduce((s, p) => s + p.applications.matched, 0)
  const totalNda = projectAnalytics.reduce((s, p) => s + p.nda_consents, 0)

  return {
    success: true,
    data: {
      global: {
        total_applications: totalApplications,
        total_matches: totalMatches,
        total_nda_consents: totalNda,
        match_rate: totalApplications > 0
          ? Math.round((totalMatches / totalApplications) * 10000) / 100
          : null,
      },
      projects: projectAnalytics,
    },
  }
}
```

- [ ] **Step 3.2: Run tests to verify they pass**

```bash
npx vitest run tests/unit/actions/analytics.actions.test.ts
```

Expected: all 6 tests PASS

- [ ] **Step 3.3: Run full unit suite to check for regressions**

```bash
npm run test:unit
```

Expected: all tests pass

- [ ] **Step 3.4: Commit**

```bash
git add src/actions/analytics.actions.ts
git commit -m "feat(analytics): implement getCreatorAnalytics server action"
```

---

## Task 4: AnalyticsSection component

**Files:**
- Create: `src/components/dashboard/AnalyticsSection.tsx`

- [ ] **Step 4.1: Create the component**

Create `src/components/dashboard/AnalyticsSection.tsx`:

```tsx
import Link from 'next/link'
import type { CreatorAnalytics } from '@/actions/analytics.actions'

export function AnalyticsSection({ data }: { data: CreatorAnalytics | null }) {
  if (!data || data.projects.length === 0) return null

  const { global, projects } = data

  const globalChips = [
    { value: global.total_applications, label: 'Total Applications' },
    { value: global.total_matches, label: 'Total Matches' },
    { value: global.total_nda_consents, label: 'NDA Consents' },
    {
      value: global.match_rate !== null ? `${global.match_rate}%` : '—',
      label: 'Match Rate',
    },
  ]

  return (
    <div className="mt-6">
      {/* Section header */}
      <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-4">
        CREATOR ANALYTICS
      </p>

      {/* Global chips */}
      <div className="flex flex-wrap gap-4 mb-6">
        {globalChips.map((chip) => (
          <div
            key={chip.label}
            className="bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4 flex flex-col gap-1 shadow-[0_4px_32px_rgba(0,0,0,0.07)] min-w-35"
          >
            <span className="font-unbounded font-black text-[28px] leading-none text-[#1a1918]">
              {chip.value}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#6b6762]">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Per-project table */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0ddd8]">
              {['Project', 'Status', 'NDAs', 'Applied', 'In Talks', 'Matched', 'Rejected', 'Verified', 'Match Rate'].map(
                (col) => (
                  <th
                    key={col}
                    className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b6762] pb-3 pr-4 whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_id} className="border-b border-[#f2f0ed] last:border-0">
                <td className="py-3 pr-4">
                  <Link
                    href={`/projects/${p.project_id}`}
                    className="font-sans text-[13px] font-medium text-[#1a1918] hover:text-[#e8621a] transition-colors truncate max-w-[180px] block"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f2f0ed] text-[#6b6762] capitalize whitespace-nowrap">
                    {p.status}
                  </span>
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.nda_consents}</td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.total > 0 && p.applications.verified > 0
                    ? `${p.applications.total} (${p.applications.verified}✓)`
                    : p.applications.total}
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.applications.in_talks}</td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.applications.matched}</td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.applications.rejected}</td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.applications.verified}</td>
                <td className="py-3 font-sans text-[13px] text-[#1a1918]">
                  {p.match_rate !== null ? `${p.match_rate}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4.3: Commit**

```bash
git add src/components/dashboard/AnalyticsSection.tsx
git commit -m "feat(analytics): add AnalyticsSection component"
```

---

## Task 5: Wire up dashboard page

**Files:**
- Modify: `src/app/(main)/dashboard/page.tsx`

- [ ] **Step 5.1: Add import at top of dashboard/page.tsx**

At the top of `src/app/(main)/dashboard/page.tsx`, add after the existing imports:

```ts
import { getCreatorAnalytics } from '@/actions/analytics.actions'
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection'
```

- [ ] **Step 5.2: Add getCreatorAnalytics to Promise.all**

Find the existing `Promise.all` block (currently 4 items) and add the 5th:

```ts
const [projectsResult, applicationsResult, conversationsResult, receivedCountResult, analyticsResult] =
  await Promise.all([
    getMyProjects(),
    getMyApplications(),
    getMyConversations(),
    getReceivedApplicationsCount(),
    getCreatorAnalytics(),
  ])
```

- [ ] **Step 5.3: Extract analytics data**

After the existing data extraction lines (`const projects = ...`, `const applications = ...`, etc.), add:

```ts
const analytics = analyticsResult.success ? analyticsResult.data : null
```

- [ ] **Step 5.4: Render AnalyticsSection after Quick links block**

Find the closing `</div>` of the Quick links block (the `div` with `className="mt-6 flex flex-wrap gap-3"`). Add the component immediately after it, before the outer closing `</div>`:

```tsx
<AnalyticsSection data={analytics} />
```

- [ ] **Step 5.5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5.6: Run full unit suite**

```bash
npm run test:unit
```

Expected: all tests pass

- [ ] **Step 5.7: Commit**

```bash
git add src/app/(main)/dashboard/page.tsx
git commit -m "feat(analytics): wire AnalyticsSection into dashboard page"
```

---

## Task 6: E2E test

**Files:**
- Modify: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 6.1: Add analytics E2E tests**

Append to `tests/e2e/dashboard.spec.ts` inside the `test.describe('Dashboard', ...)` block:

```ts
test('Dashboard shows CREATOR ANALYTICS section heading', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('CREATOR ANALYTICS')).toBeVisible()
})

test('Dashboard shows Total Applications analytics chip', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Total Applications')).toBeVisible()
})

test('Dashboard analytics project table links to project detail', async ({ page }) => {
  const projectId = process.env.TEST_PROJECT_ID!
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  // The analytics table contains a link to the seed project
  const analyticsLink = page.locator(
    `.mt-6 a[href="/projects/${projectId}"]`
  ).first()
  await expect(analyticsLink).toBeVisible()
})
```

- [ ] **Step 6.2: Run E2E tests**

```bash
npm run test:e2e -- --grep "Dashboard"
```

Expected: all dashboard tests including the 3 new ones pass

- [ ] **Step 6.3: Commit**

```bash
git add tests/e2e/dashboard.spec.ts
git commit -m "test(e2e): verify creator analytics section on dashboard"
```

---

## Self-Review

**Spec coverage:**
- ✅ Global chips: total_applications, total_matches, nda_consents, match_rate
- ✅ Per-project table: all 9 columns including verified format `12 (3✓)`
- ✅ `analytics.actions.ts` new file
- ✅ `AnalyticsSection.tsx` new component
- ✅ Dashboard page integration
- ✅ Section hidden when no projects (`if (!data || data.projects.length === 0) return null`)
- ✅ Match Rate `—` when no applications
- ✅ Graceful fallback: `analyticsResult.success ? ... : null`
- ✅ Desktop-first, horizontal scroll on mobile

**Type consistency:** `CreatorAnalytics` and `ProjectAnalytics` defined once in `analytics.actions.ts`, imported in component and page. `match_rate` is `number | null` consistently throughout.

**No placeholders:** All steps contain complete code.
