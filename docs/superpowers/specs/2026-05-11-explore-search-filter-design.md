# Explore Search & Filter — Design Spec

**Date:** 2026-05-11
**Status:** Approved

---

## Goal

Add text search, category filter, and role filter to the Explore page. Stage and Commitment filters already exist and remain unchanged.

---

## Decisions

| Dimension | Decision |
|---|---|
| New filters | Text search (title + logline) + Category dropdown + Role text input |
| Text search | Clientseitig — `toLowerCase().includes()` on already-loaded projects |
| Category filter | Serverseitig — URL param → `getProjects({ category })`, fixed value list |
| Role filter | Clientseitig — searches `project_roles[].role_name` |
| Layout | Compact row (Search + Category + Role) above existing Stage + Commitment controls |

---

## Architecture

`explore/page.tsx` stays a Server Component. Stage, Commitment, and Category remain server-side filters (URL params → `getProjects()`). A new `ExploreResults` Client Component receives the project list and handles clientside text + role filtering.

```
explore/page.tsx (Server Component)
  ├── ExploreFilters (Client) — all filter controls, manages URL params
  └── ExploreResults (Client, NEW) — receives projects[], filters text+role live
```

**Data flow:**
1. URL params `stage`, `commitment`, `category` → `getProjects()` → filtered list passed to `ExploreResults`
2. URL params `search`, `role` → read by `ExploreResults` from `useSearchParams()` → clientside filter, no server round-trip

Both search and role are reflected in the URL so links are shareable.

---

## Files

| File | Action |
|---|---|
| `src/components/projects/ExploreFilters.tsx` | Add compact top row: Search input + Category select + Role input |
| `src/components/projects/ExploreResults.tsx` | Create: Client Component with clientside text + role filtering |
| `src/app/(main)/explore/page.tsx` | Read `category` from URL params, render `ExploreResults` instead of inline grid |

---

## ExploreFilters — UI Layout

```
[ 🔍 Search projects…        ] [ Category ▾ ] [ Role needed… ]
──────────────────────────────────────────────────────────────
STAGE:       [All] [Idea] [Concept] [Development] [Ready] [Production]
COMMITMENT:  [Any] [Hobby] [Side Project] [Serious] [Professional]
```

- **Search input:** `<input type="text">` styled like existing UI. `onChange` debounced 300ms → `router.push` with `search` param.
- **Category select:** `<select>` with fixed options (see below). `onChange` → `router.push` with `category` param.
- **Role input:** `<input type="text">`. `onChange` debounced 300ms → `router.push` with `role` param.

### Category values

```
'' → All Categories (default)
film → Feature Film
short → Short Film
documentary → Documentary
series → Series / TV
music_video → Music Video
animation → Animation
experimental → Experimental
```

These cover the realistic range for the target audience (independent filmmakers, DE/AT/CH).

---

## ExploreResults Component

**Props:**
```ts
interface ExploreResultsProps {
  projects: ProjectWithRoles[]
}
```

Reads `search` and `role` from `useSearchParams()` internally. Applies clientside filtering:

```ts
const filtered = projects
  .filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.title.toLowerCase().includes(q) || (p.logline ?? '').toLowerCase().includes(q)
  })
  .filter(p => {
    if (!role) return true
    const r = role.toLowerCase()
    return p.project_roles.some(pr => pr.role_name.toLowerCase().includes(r))
  })
```

Renders existing `ProjectCard` grid. Empty state when `filtered.length === 0`:

```
"No projects match your search. Try adjusting the filters."
```

---

## explore/page.tsx Changes

- Read `category` from `searchParams` and pass to `getProjects()`
- Read `search` and `role` from `searchParams` and pass as initial props (for SSR consistency; `ExploreResults` re-reads from URL client-side)
- Replace inline project grid with `<ExploreResults projects={projects} />`

---

## Testing

- Unit test `ExploreResults`: text filter matches title, text filter matches logline, role filter matches partial role name, empty state renders when no match, no filter shows all projects.
- No new DB migration needed.
- TypeScript must pass `tsc --noEmit` after changes.
