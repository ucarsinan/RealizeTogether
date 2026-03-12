"use client"

import { useState, useTransition } from "react"
import { confirmMatch } from "@/actions/match.actions"
import type { MatchStatus } from "@/actions/match.actions"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Clock } from "lucide-react"

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

  // Only show when still in_talks
  if (applicationStatus !== "in_talks") return null

  const iHaveConfirmed = isCreator ? status.creatorConfirmed : status.applicantConfirmed
  const isComplete = status.matchedAt !== null || (status.creatorConfirmed && status.applicantConfirmed)

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmMatch(applicationId)
      if (result.success) {
        setStatus(prev => ({
          creatorConfirmed: isCreator ? true : prev.creatorConfirmed,
          applicantConfirmed: !isCreator ? true : prev.applicantConfirmed,
          matchedAt: result.data.isComplete ? new Date().toISOString() : null,
        }))
      }
    })
  }

  // ── Matched ──
  if (isComplete) {
    return (
      <div className="bg-green-50 border-b border-green-100 px-4 py-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        <p className="text-sm font-medium text-green-800">
          You&apos;re officially matched! Time to build something great.
        </p>
      </div>
    )
  }

  // ── I've confirmed, waiting for other ──
  if (iHaveConfirmed) {
    return (
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-sm text-blue-700">
          You confirmed — waiting for the other party to confirm the match.
        </p>
      </div>
    )
  }

  // ── Ready to confirm ──
  return (
    <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-100">
        Ready to officially collaborate on this project?
      </p>
      <Button
        size="sm"
        onClick={handleConfirm}
        disabled={isPending}
        className="bg-white text-zinc-900 hover:bg-zinc-100 shrink-0"
      >
        {isPending ? (
          <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Confirming…</>
        ) : (
          <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Confirm Match</>
        )}
      </Button>
    </div>
  )
}
