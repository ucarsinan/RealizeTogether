'use client'

import { useTransition } from 'react'
import { withdrawApplication } from '@/actions/application.actions'

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleWithdraw() {
    if (!confirm('Withdraw this application?')) return
    startTransition(async () => {
      await withdrawApplication(applicationId)
    })
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={isPending}
      className="font-sans text-[11px] text-[#6b6762] hover:text-red-500 border border-[#e0ddd8] hover:border-red-300 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
    >
      {isPending ? 'Withdrawing…' : 'Withdraw'}
    </button>
  )
}
