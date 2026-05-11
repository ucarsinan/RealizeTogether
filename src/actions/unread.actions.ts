'use server'

import { getMyConversations } from '@/actions/conversation.actions'

export async function getTotalUnreadCount(): Promise<number> {
  const result = await getMyConversations()
  if (!result.success) return 0
  return result.data.reduce((sum, c) => sum + c.unread_count, 0)
}
