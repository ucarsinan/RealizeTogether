'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from '@/actions/account.actions'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function DeleteAccountButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push('/')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-sans text-[13px] text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-5 py-2.5 rounded-full transition-colors"
      >
        Delete account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-[0_8px_48px_rgba(0,0,0,0.18)] space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="font-unbounded font-bold text-[16px] tracking-[-0.02em] text-[#1a1918]">
                  Delete account
                </h2>
                <p className="font-sans text-[13px] text-[#6b6762] mt-1 leading-relaxed">
                  This permanently deletes your profile, projects, applications, and all uploaded
                  files. This action cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5">
                Type <strong className="text-[#1a1918]">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                className="font-sans w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-red-400 rounded-full px-5 py-3 text-[13px] text-[#1a1918] outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="font-sans text-[12px] text-red-600 bg-red-50 px-4 py-2.5 rounded-full">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOpen(false)
                  setConfirm('')
                  setError(null)
                }}
                disabled={isPending}
                className="flex-1 border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] font-sans text-[13px] px-5 py-2.5 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirm !== 'DELETE' || isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold font-sans text-[13px] px-5 py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
