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
