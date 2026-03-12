"use client"

import { useState, useTransition, useEffect } from "react"
import { getSynopsisUrl } from "@/actions/nda.actions"
import { NDAModal } from "./NDAModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, ExternalLink, Loader2 } from "lucide-react"

interface SynopsisViewerProps {
  projectId: string
  projectTitle: string
  requiresNda: boolean
  hasSynopsis: boolean
  initialHasConsented: boolean
  isOwner: boolean
}

export function SynopsisViewer({
  projectId,
  projectTitle,
  requiresNda,
  hasSynopsis,
  initialHasConsented,
  isOwner,
}: SynopsisViewerProps) {
  const [hasConsented, setHasConsented] = useState(initialHasConsented || isOwner)
  const [synopsisUrl, setSynopsisUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function loadSynopsis() {
    setError(null)
    startTransition(async () => {
      const result = await getSynopsisUrl(projectId)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSynopsisUrl(result.data.url)
    })
  }

  useEffect(() => {
    if (hasConsented && hasSynopsis && !synopsisUrl) {
      loadSynopsis()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConsented])

  function handleConsented() {
    setHasConsented(true)
    setTimeout(loadSynopsis, 300)
  }

  if (!hasSynopsis) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <FileText className="w-4 h-4" />
          <span>No synopsis uploaded yet</span>
        </div>
        {isOwner && (
          <p className="text-xs text-zinc-400 mt-1 ml-6">You can add one in your project settings</p>
        )}
      </div>
    )
  }

  if (!hasConsented && requiresNda) {
    return (
      <NDAModal
        projectId={projectId}
        projectTitle={projectTitle}
        onConsented={handleConsented}
      />
    )
  }

  if (!synopsisUrl && !isPending) {
    return (
      <button
        onClick={loadSynopsis}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-zinc-800">Synopsis / Pitch Deck</p>
            <p className="text-xs text-zinc-500 mt-0.5">Click to view</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
      </button>
    )
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-zinc-200 text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading synopsis...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-red-50 border border-red-200">
        <span className="text-sm text-red-600">{error}</span>
        <Button variant="outline" size="sm" onClick={loadSynopsis}>Retry</Button>
      </div>
    )
  }

  if (synopsisUrl) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-zinc-800">Synopsis / Pitch Deck</span>
          </div>
          <div className="flex items-center gap-2">
            {requiresNda && !isOwner && (
              <Badge variant="secondary" className="gap-1 text-xs bg-green-50 text-green-700 border-green-200">
                <ShieldCheck className="w-3 h-3" />
                NDA signed
              </Badge>
            )}
            {isOwner && <Badge variant="secondary" className="text-xs">Your project</Badge>}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
          <iframe src={synopsisUrl} className="w-full h-[500px]" title="Synopsis" />
        </div>
        <a
          href={synopsisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open in new tab
        </a>
      </div>
    )
  }

  return null
}
