'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f0ed] px-6">
      <div className="w-full max-w-100 bg-white border border-[#e0ddd8] rounded-2xl p-10 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
          NEW PASSWORD
        </p>
        <h1 className="font-unbounded font-black text-[24px] tracking-[-0.03em] text-[#1a1918] mb-2">
          Set a new password.
        </h1>
        <p className="font-sans text-[13px] text-[#6b6762] mb-8 leading-relaxed">
          Choose a strong password with at least 8 characters.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="password"
              className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="font-sans w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-3 text-[13px] text-[#1a1918] outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="font-sans w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-3 text-[13px] text-[#1a1918] outline-none transition-colors duration-200"
            />
          </div>

          {error && (
            <p className="font-sans text-[12px] text-red-600 bg-red-50 px-4 py-2.5 rounded-full">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-sans w-full bg-[#e8621a] hover:bg-[#c9521a] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-[13px] px-6 py-3.5 rounded-full flex items-center justify-center gap-2 mt-2 transition-colors duration-150"
          >
            {loading ? 'Updating…' : 'Update password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
