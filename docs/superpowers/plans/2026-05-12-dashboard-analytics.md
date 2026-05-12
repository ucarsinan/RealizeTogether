# Dashboard Analytics — Stats-Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 at-a-glance stat chips (Open Projects, Applications Received, Applied, Matches, Unread) between the dashboard header and 3-column grid.

**Architecture:** One new server action (`getReceivedApplicationsCount`) fetches the Creator-side application count with a Supabase COUNT query. The dashboard page adds it to the existing `Promise.all`, derives 5 numbers, and renders a `StatsStrip` inline component — no new files, no schema changes.

**Tech Stack:** Next.js 16 App Router (Server Components), TypeScript, Supabase (Postgres + RLS), Tailwind CSS, Vitest

---

## File Map

| File | Change |
|---|---|
| `src/actions/application.actions.ts` | Append `getReceivedApplicationsCount()` |
| `src/app/(main)/dashboard/page.tsx` | Add fetch + `StatsStrip` component |
| `tests/unit/actions/application-count.test.ts` | New unit test file |

---

### Task 1: `getReceivedApplicationsCount` server action

**Files:**
- Modify: `src/actions/application.actions.ts`
- Create: `tests/unit/actions/application-count.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/actions/application-count.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getReceivedApplicationsCount } from '@/actions/application.actions'
import { createClient } from '@/lib/supabase/server'

function makeSupabase(projectIds: string[], count: number) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: projectIds.map((id) => ({ id })), error: null }),
        }
      }
      if (table === 'project_applications') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ count, error: null }),
        }
      }
      return {}
    }),
  }
}

describe('getReceivedApplicationsCount', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns count of applications across all creator projects', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase(['p1', 'p2'], 7) as never)
    const result = await getReceivedApplicationsCount()
    expect(result).toEqual({ success: true, data: 7 })
  })

  it('returns 0 when user has no projects', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([], 0) as never)
    const result = await getReceivedApplicationsCount()
    expect(result).toEqual({ success: true, data: 0 })
  })

  it('returns error when not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no auth') }),
      },
    } as never)
    const result = await getReceivedApplicationsCount()
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/sinanucar/Development/RealizeTogether
npx vitest run tests/unit/actions/application-count.test.ts
```

Expected: FAIL — `getReceivedApplicationsCount` is not exported

- [ ] **Step 3: Implement the action**

Append to the bottom of `src/actions/application.actions.ts`:

```ts
export async function getReceivedApplicationsCount(): Promise<ActionResult<number>> {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('creator_id', user.id)

  const projectIds = (projects ?? []).map((p) => p.id)
  if (projectIds.length === 0) return { success: true, data: 0 }

  const { count, error } = await supabase
    .from('project_applications')
    .select('id', { count: 'exact', head: true })
    .in('project_id', projectIds)

  if (error) return { success: false, error: error.message }
  return { success: true, data: count ?? 0 }
}
```

> Note: `{ count: 'exact', head: true }` tells Supabase to return only the count without fetching rows — zero data transfer overhead.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/unit/actions/application-count.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/actions/application.actions.ts tests/unit/actions/application-count.test.ts
git commit -m "feat(dashboard): add getReceivedApplicationsCount server action"
```

---

### Task 2: StatsStrip component + dashboard integration

**Files:**
- Modify: `src/app/(main)/dashboard/page.tsx`

- [ ] **Step 1: Add the parallel fetch and derive stats**

In `src/app/(main)/dashboard/page.tsx`, update the `Promise.all` block and add stat derivation:

Replace:
```ts
const [projectsResult, applicationsResult, conversationsResult] = await Promise.all([
  getMyProjects(),
  getMyApplications(),
  getMyConversations(),
])
```

With:
```ts
import { getReceivedApplicationsCount } from '@/actions/application.actions'

// inside DashboardPage:
const [projectsResult, applicationsResult, conversationsResult, receivedCountResult] =
  await Promise.all([
    getMyProjects(),
    getMyApplications(),
    getMyConversations(),
    getReceivedApplicationsCount(),
  ])
```

After the existing result destructuring, add:
```ts
const receivedApplicationsCount = receivedCountResult.success ? receivedCountResult.data : 0

const stats = [
  { value: projects.filter((p) => p.status === 'open').length, label: 'Open Projects' },
  { value: receivedApplicationsCount, label: 'Applications Received' },
  { value: applications.length, label: 'Applied' },
  { value: applications.filter((a) => a.status === 'matched').length, label: 'Matches' },
  {
    value: Math.min(
      conversations.reduce((sum, c) => sum + c.unread_count, 0),
      99
    ),
    label: 'Unread',
  },
]
```

- [ ] **Step 2: Render StatsStrip in JSX**

In the `return` block, between `{/* Header */}` and `{/* 3-column grid */}`, insert:

```tsx
{/* Stats Strip */}
<StatsStrip stats={stats} />
```

- [ ] **Step 3: Add the StatsStrip component**

Append to the bottom of `src/app/(main)/dashboard/page.tsx` (after the existing helper components):

```tsx
type StatItem = { value: number; label: string }

function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4 flex flex-col gap-1 shadow-[0_4px_32px_rgba(0,0,0,0.07)]"
        >
          <span className="font-unbounded font-black text-[28px] leading-none text-[#1a1918]">
            {stat.value > 99 ? '99+' : stat.value}
          </span>
          <span className="font-sans text-[11px] uppercase tracking-widest text-[#6b6762]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Run all unit tests**

```bash
npx vitest run tests/unit/
```

Expected: all tests PASS (including the new application-count test)

- [ ] **Step 6: Visual check**

Start the dev server and open `/dashboard` in the browser:

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

Verify:
- 5 chips appear in a horizontal row between the header and the 3-column grid
- Numbers are correct (0 for a fresh account is fine)
- Chips wrap on a narrow viewport (resize browser to ~375px)
- No layout shift or overflow

- [ ] **Step 7: Commit**

```bash
git add src/app/(main)/dashboard/page.tsx
git commit -m "feat(dashboard): add stats-strip with 5 at-a-glance metrics"
```

---

## Done Criteria

- [ ] `getReceivedApplicationsCount` is exported and has 3 passing unit tests
- [ ] Dashboard shows 5 stat chips with correct values
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All unit tests pass (`npx vitest run tests/unit/`)
- [ ] Chips wrap cleanly on mobile (flex-wrap)
