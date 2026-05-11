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
