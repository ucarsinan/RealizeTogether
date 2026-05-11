# Unread Badge (Soft Realtime) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an unread-message badge on the NavBar "Messages" link, BottomNav Messages icon, and auto-refresh the conversation list every 30 seconds so users know they have new messages without needing full Supabase Realtime.

**Architecture:** A new `getTotalUnreadCount()` server action sums unread counts across all user conversations (reusing `getMyConversations()`). A `useUnreadCount()` hook polls this action every 30 s and returns the count. NavBar and BottomNav import the hook and render a badge. A `MessagesPoller` Client Component calls `router.refresh()` every 30 s on `/messages` to keep per-conversation counts fresh.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind · Vitest + @testing-library/react

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/actions/conversation.actions.ts` | Modify (append) | Add `getTotalUnreadCount()` server action |
| `src/hooks/useUnreadCount.ts` | Create | 30 s polling hook, returns `number` |
| `src/components/layout/NavBar.tsx` | Modify | Badge next to "Messages" link (desktop) |
| `src/components/layout/BottomNav.tsx` | Modify | Badge on Messages icon (mobile) |
| `src/components/chat/MessagesPoller.tsx` | Create | Calls `router.refresh()` every 30 s |
| `src/app/(main)/messages/page.tsx` | Modify | Include `<MessagesPoller />` |
| `tests/unit/hooks/useUnreadCount.test.ts` | Create | Hook unit tests |

---

## Context for implementers

The codebase is a Next.js 16 App Router project with Supabase. Key facts:

- `src/actions/conversation.actions.ts` already has `getMyConversations()` which returns `ConversationPreview[]`. Each item has `unread_count: number`. This is what `getTotalUnreadCount()` will call and reduce.
- `src/components/layout/NavBar.tsx` is `'use client'`. It already fetches the user profile in `useEffect`. Just add `const unreadCount = useUnreadCount()` and render the badge.
- `src/components/layout/BottomNav.tsx` is `'use client'`. It renders `NAV_ITEMS` via `.map()`. Add `useUnreadCount()` and inject badge into the Messages item inside the map.
- `src/app/(main)/messages/page.tsx` is a Server Component (`async function`). It renders conversation list. Add `<Suspense><MessagesPoller /></Suspense>` at the bottom so the list refreshes.
- Vitest config: `tests/unit/**/*.test.ts`, environment `happy-dom`, globals enabled, alias `@` → `./src`.
- Run tests: `npx vitest run tests/unit/hooks/useUnreadCount.test.ts`
- Run typecheck: `npx tsc --noEmit`
- Design tokens: accent `#e8621a`, border `#e0ddd8`, text-muted `#6b6762`.

---

## Task 1: `getTotalUnreadCount` server action

**Files:**
- Modify: `src/actions/conversation.actions.ts` (append at bottom)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/hooks/useUnreadCount.test.ts` with the server action test first (we'll add hook tests later in Task 2):

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the entire conversation.actions module so getTotalUnreadCount
// can be tested without a real Supabase connection.
vi.mock('@/actions/conversation.actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/conversation.actions')>()
  return {
    ...actual,
    getMyConversations: vi.fn(),
  }
})

import { getTotalUnreadCount, getMyConversations } from '@/actions/conversation.actions'

function makeConv(unread_count: number) {
  return {
    id: crypto.randomUUID(),
    application_id: 'app-1',
    project_id: 'proj-1',
    project_title: 'Test Project',
    other_user: { id: 'u1', full_name: 'Alice', avatar_url: null },
    last_message: null,
    unread_count,
  }
}

describe('getTotalUnreadCount', () => {
  beforeEach(() => {
    vi.mocked(getMyConversations).mockResolvedValue({
      success: true,
      data: [makeConv(3), makeConv(2)],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns sum of unread_count across all conversations', async () => {
    const count = await getTotalUnreadCount()
    expect(count).toBe(5)
  })

  it('returns 0 when there are no conversations', async () => {
    vi.mocked(getMyConversations).mockResolvedValueOnce({ success: true, data: [] })
    const count = await getTotalUnreadCount()
    expect(count).toBe(0)
  })

  it('returns 0 when getMyConversations fails', async () => {
    vi.mocked(getMyConversations).mockResolvedValueOnce({
      success: false,
      error: 'Not authenticated',
    })
    const count = await getTotalUnreadCount()
    expect(count).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/unit/hooks/useUnreadCount.test.ts
```

Expected: FAIL — `getTotalUnreadCount is not a function` (not exported yet).

- [ ] **Step 3: Add `getTotalUnreadCount` to conversation.actions.ts**

Append at the very end of `src/actions/conversation.actions.ts` (after the helpers section):

```ts
// ─────────────────────────────────────────────
// TOTAL UNREAD COUNT (for nav badge polling)
// ─────────────────────────────────────────────

export async function getTotalUnreadCount(): Promise<number> {
  const result = await getMyConversations()
  if (!result.success) return 0
  return result.data.reduce((sum, c) => sum + c.unread_count, 0)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/unit/hooks/useUnreadCount.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/actions/conversation.actions.ts tests/unit/hooks/useUnreadCount.test.ts
git commit -m "feat: add getTotalUnreadCount server action"
```

---

## Task 2: `useUnreadCount` hook

**Files:**
- Create: `src/hooks/useUnreadCount.ts`
- Modify: `tests/unit/hooks/useUnreadCount.test.ts` (append hook tests)

- [ ] **Step 1: Append hook tests to the existing test file**

Add this block at the end of `tests/unit/hooks/useUnreadCount.test.ts` (after the `getTotalUnreadCount` describe block):

```ts
import { renderHook, act } from '@testing-library/react'
import { useUnreadCount } from '@/hooks/useUnreadCount'

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getMyConversations).mockResolvedValue({
      success: true,
      data: [makeConv(3)],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns 0 initially then updates after first fetch', async () => {
    const { result } = renderHook(() => useUnreadCount())
    expect(result.current).toBe(0)
    await act(async () => {})
    expect(result.current).toBe(3)
  })

  it('re-fetches every 30 seconds', async () => {
    const { result } = renderHook(() => useUnreadCount())
    await act(async () => {})
    expect(result.current).toBe(3)

    vi.mocked(getMyConversations).mockResolvedValue({
      success: true,
      data: [makeConv(7)],
    })
    await act(async () => { vi.advanceTimersByTime(30_000) })
    expect(result.current).toBe(7)
  })

  it('clears the interval on unmount', async () => {
    const { unmount } = renderHook(() => useUnreadCount())
    await act(async () => {})
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/unit/hooks/useUnreadCount.test.ts
```

Expected: 3 new hook tests FAIL — `useUnreadCount` not found.

- [ ] **Step 3: Create `src/hooks/useUnreadCount.ts`**

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTotalUnreadCount } from '@/actions/conversation.actions'

const POLL_INTERVAL = 30_000

export function useUnreadCount(): number {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    const n = await getTotalUnreadCount()
    setCount(n)
  }, [])

  useEffect(() => {
    fetchCount()
    const id = setInterval(fetchCount, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchCount])

  return count
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
npx vitest run tests/unit/hooks/useUnreadCount.test.ts
```

Expected: 6 tests PASS (3 server action + 3 hook).

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useUnreadCount.ts tests/unit/hooks/useUnreadCount.test.ts
git commit -m "feat: add useUnreadCount polling hook"
```

---

## Task 3: NavBar badge

**Files:**
- Modify: `src/components/layout/NavBar.tsx`

The current NavBar is at `src/components/layout/NavBar.tsx`. It's already `'use client'`. The "Messages" link is at line 107:

```tsx
<Link href="/messages" className={navLinkClass('/messages')}>
  Messages
</Link>
```

- [ ] **Step 1: Add `useUnreadCount` to NavBar**

Replace the imports block at the top of `src/components/layout/NavBar.tsx`. Add the hook import after the existing imports:

```ts
import { useUnreadCount } from '@/hooks/useUnreadCount'
```

- [ ] **Step 2: Call the hook inside `NavBar()`**

Inside the `NavBar` function body, after the existing `useState`/`useEffect` calls, add:

```ts
const unreadCount = useUnreadCount()
```

- [ ] **Step 3: Replace the Messages link with badge version**

Replace:
```tsx
<Link href="/messages" className={navLinkClass('/messages')}>
  Messages
</Link>
```

With:
```tsx
<Link
  href="/messages"
  className={`${navLinkClass('/messages')} relative inline-flex items-center gap-1.5`}
>
  Messages
  {unreadCount > 0 && (
    <span className="min-w-[16px] h-4 bg-[#e8621a] rounded-full text-white text-[9px] flex items-center justify-center font-sans font-bold px-1 leading-none">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</Link>
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Run unit tests to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/NavBar.tsx
git commit -m "feat: show unread badge on NavBar Messages link"
```

---

## Task 4: BottomNav badge

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

The current BottomNav renders `NAV_ITEMS` via `.map()`. The Messages item is `{ href: '/messages', label: 'Messages', Icon: MessageCircle }`.

- [ ] **Step 1: Add `useUnreadCount` import and call**

Add import at top of `src/components/layout/BottomNav.tsx`:

```ts
import { useUnreadCount } from '@/hooks/useUnreadCount'
```

Inside `BottomNav()`, after `const [isAuth, setIsAuth] = useState(false)`:

```ts
const unreadCount = useUnreadCount()
```

- [ ] **Step 2: Replace the map render to show badge on Messages item**

Replace the current `return` content inside the `nav` — specifically the `NAV_ITEMS.map` block:

```tsx
{NAV_ITEMS.map(({ href, label, Icon }) => {
  const active = isActive(href)
  const isMessages = href === '/messages'
  return (
    <Link
      key={href}
      href={href}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
    >
      <div className="relative">
        <Icon
          className="w-5 h-5 transition-colors duration-150"
          style={{ color: active ? '#e8621a' : '#9b978f' }}
          strokeWidth={active ? 2.5 : 1.8}
        />
        {isMessages && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-[#e8621a] rounded-full text-white text-[8px] flex items-center justify-center font-sans font-bold px-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <span
        className="font-sans text-[10px] font-medium transition-colors duration-150"
        style={{ color: active ? '#e8621a' : '#9b978f' }}
      >
        {label}
      </span>
    </Link>
  )
})}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Run unit tests**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat: show unread badge on BottomNav Messages icon"
```

---

## Task 5: MessagesPoller — auto-refresh conversation list

**Files:**
- Create: `src/components/chat/MessagesPoller.tsx`
- Modify: `src/app/(main)/messages/page.tsx`

The `/messages` page is a Server Component. Adding `MessagesPoller` as a Client Component that calls `router.refresh()` every 30 s keeps the server-rendered conversation list (including per-conversation unread counts) fresh while the user is on that page.

- [ ] **Step 1: Create `src/components/chat/MessagesPoller.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const POLL_INTERVAL = 30_000

export function MessagesPoller() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
    }, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [router])

  return null
}
```

- [ ] **Step 2: Add `MessagesPoller` to `src/app/(main)/messages/page.tsx`**

Add the import at the top of the file (with other imports):

```ts
import { Suspense } from 'react'
import { MessagesPoller } from '@/components/chat/MessagesPoller'
```

Add `<MessagesPoller />` just before the closing `</div>` of the outer wrapper in the return:

```tsx
      {/* Auto-refresh conversation list every 30 s */}
      <Suspense>
        <MessagesPoller />
      </Suspense>
    </div>  {/* closes max-w-270 div */}
  </div>  {/* closes min-h-screen div */}
```

The full updated return should look like this (only showing the outer structure — keep all inner content unchanged):

```tsx
return (
  <div className="min-h-screen bg-[#f2f0ed]">
    <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
      {/* Header */}
      ...existing header...

      {conversations.length === 0 ? (
        ...existing empty state...
      ) : (
        ...existing conversation list...
      )}

      <Suspense>
        <MessagesPoller />
      </Suspense>
    </div>
  </div>
)
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Run all unit tests**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/MessagesPoller.tsx src/app/(main)/messages/page.tsx
git commit -m "feat: auto-refresh conversation list every 30s via MessagesPoller"
```

---

## Self-Review

**Spec coverage:**
- ✅ Unread badge in NavBar (desktop) — Task 3
- ✅ Unread badge in BottomNav (mobile) — Task 4
- ✅ 30s polling — `useUnreadCount` hook + `MessagesPoller`
- ✅ No Supabase Realtime / no Live-Typing — polling only, consistent with Option B decision
- ✅ Conversation list auto-refreshes — Task 5

**Placeholder scan:** None found. Every step has concrete code.

**Type consistency:**
- `getTotalUnreadCount(): Promise<number>` — used consistently in `useUnreadCount.ts`
- `useUnreadCount(): number` — used consistently in `NavBar.tsx` and `BottomNav.tsx`
- `MessagesPoller` — no props, returns `null`
- `makeConv(unread_count)` factory in tests — matches `ConversationPreview` type from `conversation.actions.ts`
