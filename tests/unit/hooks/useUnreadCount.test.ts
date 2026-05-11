import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ConversationPreview } from '@/actions/conversation.actions'

vi.mock('@/actions/conversation.actions', () => ({
  getMyConversations: vi.fn(),
}))

import { getTotalUnreadCount } from '@/actions/unread.actions'
import { getMyConversations } from '@/actions/conversation.actions'

function makeConv(unread_count: number): ConversationPreview {
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
