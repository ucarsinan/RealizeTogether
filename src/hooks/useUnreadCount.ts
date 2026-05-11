'use client'

import { useState, useEffect } from 'react'
import { getTotalUnreadCount } from '@/actions/unread.actions'

const POLL_INTERVAL = 30_000

export function useUnreadCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const n = await getTotalUnreadCount()
        setCount(n)
      } catch {
        // polling continues on next interval tick; count stays at last known value
      }
    }

    fetchCount()
    const id = setInterval(fetchCount, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return count
}
