# Explore Search & Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clientside text search (title + logline), a category dropdown, and a role text filter to the Explore page.

**Architecture:** Server Component (`explore/page.tsx`) continues to handle stage, commitment, and category via URL params → `getProjects()`. A new `ExploreResults` Client Component receives the loaded project list and filters it clientside by `search` and `role` (read from URL via `useSearchParams()`). The core filter logic is extracted into a pure `filterProjects()` function for easy unit testing without Next.js mocking.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind · Vitest + Testing Library · Supabase

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/projects/ExploreResults.tsx` | Create | Client Component: clientside filter + project grid |
| `tests/unit/components/ExploreResults.test.tsx` | Create | Unit tests for `filterProjects()` pure function |
| `src/app/(main)/explore/page.tsx` | Modify | Read `category` from URL, render `ExploreResults` |
| `src/components/projects/ExploreFilters.tsx` | Modify | Add compact top row: Search + Category + Role inputs |

---

## Task 1: Write failing tests for `filterProjects`

**Files:**
- Create: `tests/unit/components/ExploreResults.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// tests/unit/components/ExploreResults.test.tsx
import { describe, it, expect } from 'vitest'
import { filterProjects } from '@/components/projects/ExploreResults'
import type { ProjectWithRoles } from '@/lib/types'

const makeProject = (overrides: Partial<ProjectWithRoles> = {}): ProjectWithRoles => ({
  id: 'proj-1',
  creator_id: 'user-1',
  title: 'Dark Horizon',
  logline: 'A fisherman discovers an ancient secret.',
  description: 'Full description here.',
  category: 'film',
  stage: 'concept',
  commitment_type: 'serious',
  collab_type: 'revenue_share',
  requires_nda: false,
  synopsis_url: null,
  status: 'open',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  project_roles: [
    { id: 'role-1', project_id: 'proj-1', role_name: 'Director of Photography', quantity: 1, description: null },
  ],
  profiles: {
    id: 'user-1',
    full_name: 'Jane Doe',
    avatar_url: null,
    is_verified: false,
    video_url: null,
  },
  ...overrides,
})

describe('filterProjects — text search', () => {
  it('returns all projects when search is empty', () => {
    const projects = [makeProject(), makeProject({ id: 'proj-2', title: 'Other Film' })]
    expect(filterProjects(projects, '', '')).toHaveLength(2)
  })

  it('matches by title (case-insensitive)', () => {
    const projects = [makeProject({ title: 'Dark Horizon' }), makeProject({ id: 'proj-2', title: 'Bright Future' })]
    expect(filterProjects(projects, 'dark', '')).toHaveLength(1)
    expect(filterProjects(projects, 'dark', '')[0].title).toBe('Dark Horizon')
  })

  it('matches by logline (case-insensitive)', () => {
    const projects = [
      makeProject({ logline: 'A fisherman discovers an ancient secret.' }),
      makeProject({ id: 'proj-2', logline: 'A robot falls in love.' }),
    ]
    expect(filterProjects(projects, 'fisherman', '')).toHaveLength(1)
  })

  it('returns empty array when nothing matches', () => {
    const projects = [makeProject({ title: 'Dark Horizon', logline: 'A fisherman story.' })]
    expect(filterProjects(projects, 'zombie', '')).toHaveLength(0)
  })

  it('handles null logline without crashing', () => {
    const projects = [makeProject({ title: 'Dark Horizon', logline: null })]
    expect(filterProjects(projects, 'horizon', '')).toHaveLength(1)
  })
})

describe('filterProjects — role filter', () => {
  it('returns all projects when role is empty', () => {
    const projects = [makeProject(), makeProject({ id: 'proj-2', title: 'Other' })]
    expect(filterProjects(projects, '', '')).toHaveLength(2)
  })

  it('matches partial role name (case-insensitive)', () => {
    const projects = [
      makeProject({
        project_roles: [{ id: 'r1', project_id: 'proj-1', role_name: 'Director of Photography', quantity: 1, description: null }],
      }),
      makeProject({
        id: 'proj-2',
        title: 'Other',
        project_roles: [{ id: 'r2', project_id: 'proj-2', role_name: 'Sound Designer', quantity: 1, description: null }],
      }),
    ]
    expect(filterProjects(projects, '', 'photography')).toHaveLength(1)
    expect(filterProjects(projects, '', 'photography')[0].title).toBe('Dark Horizon')
  })

  it('matches project if any of its roles matches', () => {
    const projects = [
      makeProject({
        project_roles: [
          { id: 'r1', project_id: 'proj-1', role_name: 'Director', quantity: 1, description: null },
          { id: 'r2', project_id: 'proj-1', role_name: 'Editor', quantity: 1, description: null },
        ],
      }),
    ]
    expect(filterProjects(projects, '', 'editor')).toHaveLength(1)
  })

  it('returns empty when no role matches', () => {
    const projects = [makeProject()]
    expect(filterProjects(projects, '', 'actor')).toHaveLength(0)
  })
})

describe('filterProjects — combined', () => {
  it('applies both text and role filter simultaneously', () => {
    const projects = [
      makeProject({ title: 'Dark Horizon', project_roles: [{ id: 'r1', project_id: 'proj-1', role_name: 'Editor', quantity: 1, description: null }] }),
      makeProject({ id: 'proj-2', title: 'Dark Night', project_roles: [{ id: 'r2', project_id: 'proj-2', role_name: 'Director', quantity: 1, description: null }] }),
    ]
    // matches title 'dark' → both; then role 'editor' → only proj-1
    expect(filterProjects(projects, 'dark', 'editor')).toHaveLength(1)
    expect(filterProjects(projects, 'dark', 'editor')[0].title).toBe('Dark Horizon')
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm run test:unit
```

Expected: 10 new tests FAIL with `Cannot find module '@/components/projects/ExploreResults'`

---

## Task 2: Implement `ExploreResults`

**Files:**
- Create: `src/components/projects/ExploreResults.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/projects/ExploreResults.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { ProjectWithRoles } from '@/lib/types'

export function filterProjects(
  projects: ProjectWithRoles[],
  search: string,
  role: string
): ProjectWithRoles[] {
  const q = search.toLowerCase()
  const r = role.toLowerCase()

  return projects
    .filter((p) => {
      if (!q) return true
      return p.title.toLowerCase().includes(q) || (p.logline ?? '').toLowerCase().includes(q)
    })
    .filter((p) => {
      if (!r) return true
      return p.project_roles.some((pr) => pr.role_name.toLowerCase().includes(r))
    })
}

interface ExploreResultsProps {
  projects: ProjectWithRoles[]
}

export function ExploreResults({ projects }: ExploreResultsProps) {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') ?? ''

  const filtered = filterProjects(projects, search, role)

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-[#e0ddd8] rounded-2xl">
        <p className="font-sans text-[13px] text-[#6b6762]">
          No projects match your search. Try adjusting the filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm run test:unit
```

Expected: all tests pass (previously failing 10 + existing 23 = 33 total)

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/projects/ExploreResults.tsx tests/unit/components/ExploreResults.test.tsx
git commit -m "feat: add ExploreResults client component with clientside search and role filter"
```

---

## Task 3: Update `explore/page.tsx`

**Files:**
- Modify: `src/app/(main)/explore/page.tsx`

- [ ] **Step 1: Replace the page content**

Current file at `src/app/(main)/explore/page.tsx`. Replace entirely with:

```tsx
import { Suspense } from 'react'
import { getProjects } from '@/actions/project.actions'
import { ExploreFilters } from '@/components/projects/ExploreFilters'
import { ExploreResults } from '@/components/projects/ExploreResults'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import type { ProjectStage, CommitmentType } from '@/lib/types'

type SearchParams = Promise<{
  stage?: ProjectStage
  commitment?: CommitmentType
  category?: string
  search?: string
  role?: string
}>

export const metadata = {
  title: 'Explore Projects – Realize Together',
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const result = await getProjects({
    stage: params.stage,
    commitment_type: params.commitment,
    category: params.category,
  })

  const projects = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
        <div className="mb-8">
          <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            DISCOVER
          </p>
          <Breadcrumb items={[{ label: 'Explore' }]} />
          <h1 className="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Find your next project.
          </h1>
        </div>

        <Suspense>
          <ExploreFilters
            currentStage={params.stage}
            currentCommitment={params.commitment}
            currentCategory={params.category}
          />
        </Suspense>

        <div className="mt-8">
          <Suspense>
            <ExploreResults projects={projects} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: error on `currentCategory` prop — `ExploreFilters` doesn't accept it yet. This is expected and will be fixed in Task 4.

- [ ] **Step 3: Commit (skip for now — wait for Task 4)**

Hold this commit until `ExploreFilters` is updated in Task 4.

---

## Task 4: Update `ExploreFilters`

**Files:**
- Modify: `src/components/projects/ExploreFilters.tsx`

- [ ] **Step 1: Replace the file entirely**

```tsx
// src/components/projects/ExploreFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Feature Film', value: 'film' },
  { label: 'Short Film', value: 'short' },
  { label: 'Documentary', value: 'documentary' },
  { label: 'Series / TV', value: 'series' },
  { label: 'Music Video', value: 'music_video' },
  { label: 'Animation', value: 'animation' },
  { label: 'Experimental', value: 'experimental' },
]

const stageOptions = [
  { label: 'All Stages', value: '' },
  { label: 'Idea', value: 'idea' },
  { label: 'Concept', value: 'concept' },
  { label: 'Development', value: 'development' },
  { label: 'Ready', value: 'ready' },
  { label: 'Production', value: 'production' },
]

const commitmentOptions = [
  { label: 'Any', value: '' },
  { label: 'Hobby', value: 'hobby' },
  { label: 'Side Project', value: 'side_project' },
  { label: 'Serious', value: 'serious' },
  { label: 'Professional', value: 'professional' },
]

interface ExploreFiltersProps {
  currentStage?: string
  currentCommitment?: string
  currentCategory?: string
}

const sectionLabel =
  'font-unbounded text-[9px] font-bold tracking-[.15em] uppercase text-[#6b6762] mb-2'

export function ExploreFilters({
  currentStage,
  currentCommitment,
  currentCategory,
}: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/explore?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleSearch = useCallback(
    (value: string) => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
      searchDebounce.current = setTimeout(() => updateFilter('search', value.trim()), 300)
    },
    [updateFilter]
  )

  const handleRole = useCallback(
    (value: string) => {
      if (roleDebounce.current) clearTimeout(roleDebounce.current)
      roleDebounce.current = setTimeout(() => updateFilter('role', value.trim()), 300)
    },
    [updateFilter]
  )

  const inputClass =
    'font-sans text-[13px] text-[#1a1918] placeholder:text-[#6b6762] bg-white border border-[#e0ddd8] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e8621a] transition-colors w-full'

  return (
    <div className="space-y-4">
      {/* Compact top row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search projects…"
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className={inputClass + ' flex-[2]'}
        />
        <select
          defaultValue={currentCategory ?? ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          className={inputClass + ' flex-1'}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Role needed…"
          defaultValue={searchParams.get('role') ?? ''}
          onChange={(e) => handleRole(e.target.value)}
          className={inputClass + ' flex-1'}
        />
      </div>

      {/* Stage */}
      <div>
        <p className={sectionLabel}>STAGE</p>
        <div className="overflow-x-auto">
          <SegmentedControl
            options={stageOptions}
            value={currentStage ?? ''}
            onChange={(val) => updateFilter('stage', val)}
          />
        </div>
      </div>

      {/* Commitment */}
      <div>
        <p className={sectionLabel}>COMMITMENT</p>
        <div className="overflow-x-auto">
          <SegmentedControl
            options={commitmentOptions}
            value={currentCommitment ?? ''}
            onChange={(val) => updateFilter('commitment', val)}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run full test suite**

```bash
npm run test:unit
```

Expected: 33 tests pass, 0 failures

- [ ] **Step 4: Commit both Task 3 + Task 4 changes together**

```bash
git add src/app/\(main\)/explore/page.tsx src/components/projects/ExploreFilters.tsx
git commit -m "feat: add search, category, and role filters to Explore page"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open http://localhost:3000/explore**

Verify:
- Top row visible: Search input + Category dropdown + Role input
- Stage + Commitment SegmentedControls still present below
- Project grid renders correctly

- [ ] **Step 3: Test text search**

Type "dark" in the search box. After 300ms: only projects with "dark" in title or logline remain.

- [ ] **Step 4: Test category filter**

Select "Documentary" from the dropdown. URL updates to `?category=documentary`. Grid re-fetches from server with category filter.

- [ ] **Step 5: Test role filter**

Type "director" in the Role field. After 300ms: only projects that have a role containing "director" remain.

- [ ] **Step 6: Test combined filters**

Set Stage = "Concept" and type "film" in search. Both filters apply simultaneously.

- [ ] **Step 7: Test empty state**

Search for a term that matches nothing → "No projects match your search. Try adjusting the filters." message appears.

- [ ] **Step 8: Push to remote**

```bash
git push origin main
```
