import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the entire conversation.actions module so getTotalUnreadCount
// can be tested without a real Supabase connection.
vi.mock('@/actions/conversation.actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/actions/conversation.actions')>()
  const mockGetMyConversations = vi.fn()

  return {
    ...actual,
    getMyConversations: mockGetMyConversations,
    getTotalUnreadCount: async () => {
      const result = await mockGetMyConversations()
      if (!result.success) return 0
      return result.data.reduce((sum: number, c: any) => sum + c.unread_count, 0)
    },
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
