import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getProjectMatches, getTalentMatches } from '@/actions/matching.actions'
import { createClient } from '@/lib/supabase/server'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeAuthSupabase(userId: string) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }
}

function makeOwnerSupabase(userId: string, creatorId: string) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { creator_id: creatorId }, error: null }),
        }
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'u2', full_name: 'Alice', avatar_url: null }],
            error: null,
          }),
        }
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() }
    }),
  }
}

describe('getProjectMatches', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns matches from FastAPI on success', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        matches: [{ project_id: 'p1', role_id: 'r1', role_name: 'DP', score: 0.87 }],
      }),
    })

    const result = await getProjectMatches('u1')
    expect(result).toEqual({
      success: true,
      data: [{ project_id: 'p1', role_id: 'r1', role_name: 'DP', score: 0.87 }],
    })
  })

  it('returns empty array when FastAPI is unreachable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await getProjectMatches('u1')
    expect(result).toEqual({ success: true, data: [] })
  })

  it('returns empty array when FastAPI returns non-ok', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthSupabase('u1') as never)
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    const result = await getProjectMatches('u1')
    expect(result).toEqual({ success: true, data: [] })
  })
})

describe('getTalentMatches', () => {
  afterEach(() => vi.clearAllMocks())

  it('returns empty array when caller is not project owner', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'different-user') as never)

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({ success: true, data: [] })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns matches with resolved profile data when caller is owner', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'u1') as never)
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        matches: [{ user_id: 'u2', score: 0.84, matched_role: 'Sound Designer' }],
      }),
    })

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({
      success: true,
      data: [
        {
          user_id: 'u2',
          score: 0.84,
          matched_role: 'Sound Designer',
          profile: { id: 'u2', full_name: 'Alice', avatar_url: null },
        },
      ],
    })
  })

  it('returns empty array when FastAPI is unreachable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeOwnerSupabase('u1', 'u1') as never)
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await getTalentMatches('proj-1')
    expect(result).toEqual({ success: true, data: [] })
  })
})
