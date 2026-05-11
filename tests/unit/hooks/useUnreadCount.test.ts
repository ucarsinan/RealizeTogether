import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/actions/unread.actions', () => ({
  getTotalUnreadCount: vi.fn(),
}))

import { useUnreadCount } from '@/hooks/useUnreadCount'
import { getTotalUnreadCount } from '@/actions/unread.actions'

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getTotalUnreadCount).mockResolvedValue(3)
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

    vi.mocked(getTotalUnreadCount).mockResolvedValue(7)
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
