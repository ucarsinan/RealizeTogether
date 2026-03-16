'use client'

import { useState, useTransition } from 'react'
import { confirmMatch } from '@/actions/match.actions'
import type { MatchStatus } from '@/actions/match.actions'
import { CheckCircle, Loader2, Clock } from 'lucide-react'

interface MatchConfirmBannerProps {
  applicationId: string
  applicationStatus: string
  isCreator: boolean
  initialStatus: MatchStatus
}

export function MatchConfirmBanner({
  applicationId,
  applicationStatus,
  isCreator,
  initialStatus,
}: MatchConfirmBannerProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()

  if (applicationStatus !== 'in_talks') return null

  const iHaveConfirmed = isCreator ? status.creatorConfirmed : status.applicantConfirmed
  const isComplete =
    status.matchedAt !== null || (status.creatorConfirmed && status.applicantConfirmed)

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmMatch(applicationId)
      if (result.success) {
        setStatus((prev) => ({
          creatorConfirmed: isCreator ? true : prev.creatorConfirmed,
          applicantConfirmed: !isCreator ? true : prev.applicantConfirmed,
          matchedAt: result.data.isComplete ? new Date().toISOString() : null,
        }))
      }
    })
  }

  if (isComplete) {
    return (
      <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        <p className="font-sans text-[13px] font-medium text-green-800">
          You&apos;re officially matched! Time to build something great.
        </p>
      </div>
    )
  }

  if (iHaveConfirmed) {
    return (
      <div className="bg-[#fdf2ec] border-b border-[#e8621a]/20 px-6 py-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#e8621a] shrink-0" />
        <p className="font-sans text-[13px] text-[#e8621a]">
          You confirmed — waiting for the other party to confirm the match.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1918] px-6 py-3 flex items-center justify-between gap-4">
      <p className="font-sans text-[13px] text-white/90">
        Ready to officially collaborate on this project?
      </p>
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="flex items-center gap-1.5 bg-[#e8621a] hover:bg-[#c9521a] text-white font-sans text-[12px] font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-60 shrink-0"
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming…
          </>
        ) : (
          <>
            <CheckCircle className="w-3.5 h-3.5" /> Confirm Match
          </>
        )}
      </button>
    </div>
  )
}
