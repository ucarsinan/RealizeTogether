# Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix register role not being saved, and display extracted skills on the public profile page.

**Architecture:** Two independent changes — QW1 wires `selectedRole` from register form into Supabase Auth metadata, then reads it back in the callback route to write it into `profiles.role`. QW2 adds a `skills` read path: extend the `Profile` type and render a new card in `ProfileView.tsx` when skills are present.

**Tech Stack:** Next.js 16 App Router · TypeScript · Supabase (Auth + Postgres) · Tailwind · Vitest + Testing Library

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/20260511000000_add_role_to_profiles.sql` | Create | DB migration — `role text` column on `profiles` |
| `src/lib/types/index.ts` | Modify | Add `role` + `skills` to `Profile` type |
| `src/app/(auth)/register/page.tsx` | Modify | Pass `role` in signUp metadata |
| `src/app/auth/callback/route.ts` | Modify | Write `role` from metadata into `profiles` |
| `src/components/profile/ProfileView.tsx` | Modify | Add Skills card |
| `tests/unit/components/ProfileView.test.tsx` | Create | Unit tests for Skills card |

---

## Task 1: DB Migration — `role` column

**Files:**
- Create: `supabase/migrations/20260511000000_add_role_to_profiles.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260511000000_add_role_to_profiles.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;
```

- [ ] **Step 2: Apply migration via Supabase Dashboard or CLI**

Option A — Supabase CLI (if configured):
```bash
supabase db push
```

Option B — Supabase Dashboard:
Open Table Editor → `profiles` → Add column `role` (type: text, nullable: true, no default).

Verify in Dashboard: `profiles` table now has column `role text NULL`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260511000000_add_role_to_profiles.sql
git commit -m "chore: add role column to profiles table"
```

---

## Task 2: Extend `Profile` type

**Files:**
- Modify: `src/lib/types/index.ts`

The generated `database.types.ts` is outdated and does not include `role` or `skills`. We extend `Profile` manually here.

- [ ] **Step 1: Replace the `Profile` type alias**

Current code in `src/lib/types/index.ts` (line 16):
```ts
export type Profile = Tables<'profiles'>
```

Replace with:
```ts
export type Profile = Tables<'profiles'> & {
  role: string | null
  skills: string[] | null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `Profile`.

- [ ] **Step 3: Run unit tests to make sure nothing broke**

```bash
npm run test:unit
```

Expected: all 18 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types/index.ts
git commit -m "feat: extend Profile type with role and skills fields"
```

---

## Task 3: Register page — pass `role` in signUp metadata

**Files:**
- Modify: `src/app/(auth)/register/page.tsx:67-71`

- [ ] **Step 1: Update `handleSubmit` in `register/page.tsx`**

Current code (lines 67–71):
```ts
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } },
})
```

Replace with:
```ts
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      ...(selectedRole ? { role: selectedRole } : {}),
    },
  },
})
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: all 18 tests pass (register page has no unit test, so no new failures).

- [ ] **Step 3: Manual smoke test**

Start dev server:
```bash
npm run dev
```

Go to http://localhost:3000/register, fill in name/email/password, select a role (e.g. "Director"), submit.

In Supabase Dashboard → Authentication → Users → find the new user → check `raw_user_meta_data` — it should contain `{ "full_name": "...", "role": "Director" }`.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/register/page.tsx
git commit -m "fix: pass selectedRole in signUp metadata during registration"
```

---

## Task 4: Auth callback — write `role` into `profiles`

**Files:**
- Modify: `src/app/auth/callback/route.ts`

After `exchangeCodeForSession` succeeds, the user session is active. We read `user_metadata.role` and update the profile row.

- [ ] **Step 1: Update `route.ts`**

Current file:
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard/profile?new=1`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
```

Replace with:
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      if (user && role) {
        await supabase.from('profiles').update({ role }).eq('id', user.id)
      }
      return NextResponse.redirect(`${origin}/dashboard/profile?new=1`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual end-to-end test**

Register a new user with role "Producer".
Click the confirmation email link.
In Supabase Dashboard → Table Editor → `profiles` → find the row for the new user.
Verify `role` column = `"Producer"`.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "fix: write role from auth metadata into profiles on email confirmation"
```

---

## Task 5: ProfileView — write failing test for Skills card

**Files:**
- Create: `tests/unit/components/ProfileView.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/components/ProfileView.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileView } from '@/components/profile/ProfileView'
import type { Profile } from '@/lib/types'

const baseProfile: Profile = {
  id: 'user-1',
  full_name: 'Jane Doe',
  bio: null,
  avatar_url: null,
  video_url: null,
  portfolio_url: null,
  imdb_url: null,
  vimeo_url: null,
  linkedin_url: null,
  is_verified: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  role: null,
  skills: null,
}

describe('ProfileView — Skills card', () => {
  it('does not render skills card when skills is null', () => {
    render(<ProfileView profile={{ ...baseProfile, skills: null }} isOwner={false} />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('does not render skills card when skills array is empty', () => {
    render(<ProfileView profile={{ ...baseProfile, skills: [] }} isOwner={false} />)
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('renders skills card with chip for each skill', () => {
    render(
      <ProfileView
        profile={{ ...baseProfile, skills: ['Directing', 'Screenwriting', 'Final Cut Pro'] }}
        isOwner={false}
      />
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Directing')).toBeInTheDocument()
    expect(screen.getByText('Screenwriting')).toBeInTheDocument()
    expect(screen.getByText('Final Cut Pro')).toBeInTheDocument()
  })

  it('renders skills card when user is owner', () => {
    render(
      <ProfileView
        profile={{ ...baseProfile, skills: ['Directing'] }}
        isOwner={true}
      />
    )
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('Directing')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm run test:unit
```

Expected: 4 new tests FAIL with something like "Cannot find module" or "Skills not found in document".

---

## Task 6: ProfileView — implement Skills card

**Files:**
- Modify: `src/components/profile/ProfileView.tsx:82-102`

- [ ] **Step 1: Add Skills card after the Links section**

Current end of the component (after line 102):
```tsx
      {/* Portfolio links */}
      {activeLinks.length > 0 && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <h2 className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-4">
            Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {activeLinks.map(({ key, label }) => (
              <a
                key={key}
                href={profile[key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#1a1918] border border-[#e0ddd8] hover:border-[#e8621a] hover:text-[#e8621a] px-4 py-2 rounded-full transition-colors"
              >
                {label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

Replace with:
```tsx
      {/* Portfolio links */}
      {activeLinks.length > 0 && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <h2 className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-4">
            Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {activeLinks.map(({ key, label }) => (
              <a
                key={key}
                href={profile[key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#1a1918] border border-[#e0ddd8] hover:border-[#e8621a] hover:text-[#e8621a] px-4 py-2 rounded-full transition-colors"
              >
                {label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <h2 className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-4">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[#e0ddd8] rounded-full px-3 py-1 font-sans text-[13px] text-[#1a1918]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests — verify they pass**

```bash
npm run test:unit
```

Expected: all 22 tests pass (18 existing + 4 new).

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual visual check**

Start dev server:
```bash
npm run dev
```

Open a profile that has skills (or temporarily hardcode `skills: ['Directing', 'Screenwriting']` into the ProfileView props call to verify rendering).

Verify: Skills card appears below Links, correct styling, no card rendered when skills absent.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/components/ProfileView.test.tsx src/components/profile/ProfileView.tsx
git commit -m "feat: display extracted skills as card on public profile"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full test suite**

```bash
npm run test:unit
```

Expected: 22 tests pass, 0 failures.

- [ ] **Step 2: TypeScript clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: End-to-end manual check**

1. Register with role "Writer" → confirm email → check Supabase Dashboard: `profiles.role = "Writer"`
2. Open public profile of a user with skills → Skills card visible
3. Open public profile of a user without skills → no Skills card
