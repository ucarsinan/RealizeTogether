import { describe, it, expect, vi, afterEach } from 'vitest'

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
    const result = await getReceivedApplicationsCount()
    expect(result).toEqual({ success: false, error: 'DB error' })
  })

  it('returns error when applications count query fails', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [{ id: 'p1' }], error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ count: null, error: { message: 'count failed' } }),
        }
      }),
    } as never)
    const result = await getReceivedApplicationsCount()
    expect(result).toEqual({ success: false, error: 'count failed' })
  })
})
