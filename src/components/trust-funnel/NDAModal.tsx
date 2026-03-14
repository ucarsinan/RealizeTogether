'use client'

import { useState, useTransition } from 'react'
import { submitNdaConsent } from '@/actions/nda.actions'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, ShieldCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NDAModalProps {
  projectId: string
  projectTitle: string
  onConsented: () => void
}

export function NDAModal({ projectId, projectTitle, onConsented }: NDAModalProps) {
  const [isPending, startTransition] = useTransition()
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  function handleConsent() {
    if (!checked) return
    setError(null)

    startTransition(async () => {
      const result = await submitNdaConsent(projectId)
      if (!result.success) {
        setError(result.error)
        return
      }
      setIsOpen(false)
      onConsented()
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-zinc-500 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <Lock className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-zinc-800">Synopsis protected</p>
            <p className="text-xs text-zinc-500 mt-0.5">Sign NDA to access pitch deck / synopsis</p>
          </div>
        </div>
        <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full group-hover:bg-zinc-200 transition-colors">
          View &amp; Sign NDA →
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isPending && setIsOpen(false)}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-zinc-900 px-6 pt-7 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Non-Disclosure Agreement</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{projectTitle}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-64 overflow-y-auto text-sm text-zinc-600 leading-relaxed">
          <p>
            By accessing the synopsis, pitch deck, or any protected materials for this project, you
            agree to the following non-disclosure terms:
          </p>
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              <strong className="text-zinc-800">Confidentiality:</strong> All materials are strictly
              confidential and may not be shared without explicit written consent from the project
              creator.
            </li>
            <li>
              <strong className="text-zinc-800">Purpose:</strong> You may only use the materials to
              evaluate your interest in collaborating on this specific project.
            </li>
            <li>
              <strong className="text-zinc-800">Intellectual Property:</strong> All creative content
              remains the exclusive property of the project creator.
            </li>
            <li>
              <strong className="text-zinc-800">No Obligation:</strong> This NDA does not obligate
              either party to enter into a collaboration agreement.
            </li>
            <li>
              <strong className="text-zinc-800">Logging:</strong> Your consent is recorded with a
              timestamp for legal documentation purposes.
            </li>
          </ol>
          <p className="text-xs text-zinc-400 pt-1">
            Your digital acceptance constitutes a legally binding agreement.
          </p>
        </div>

        <div className="px-6 pb-2 space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center',
                  checked
                    ? 'bg-zinc-900 border-zinc-900'
                    : 'border-zinc-300 group-hover:border-zinc-500'
                )}
              >
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-zinc-700 leading-snug">
              I have read and agree to the Non-Disclosure Agreement.
            </span>
          </label>
        </div>

        <div className="px-6 pb-6 pt-3 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-zinc-900 hover:bg-zinc-800"
            onClick={handleConsent}
            disabled={!checked || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" /> Sign &amp; Access
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
