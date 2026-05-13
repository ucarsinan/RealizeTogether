'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f0ed] px-6">
      <div className="w-full max-w-100 bg-white border border-[#e0ddd8] rounded-2xl p-10 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-sans text-[12px] text-[#6b6762] hover:text-[#e8621a] transition-colors mb-8"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {sent ? (
          <div>
            <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
              CHECK YOUR INBOX
            </p>
            <h1 className="font-unbounded font-black text-[24px] tracking-[-0.03em] text-[#1a1918] mb-4">
              Email sent.
            </h1>
            <p className="font-sans text-[14px] text-[#6b6762] leading-relaxed">
              We sent a password reset link to <strong className="text-[#1a1918]">{email}</strong>.
              Check your inbox and follow the link.
            </p>
          </div>
        ) : (
          <>
            <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
              RESET PASSWORD
            </p>
            <h1 className="font-unbounded font-black text-[24px] tracking-[-0.03em] text-[#1a1918] mb-2">
              Forgot your password?
            </h1>
            <p className="font-sans text-[13px] text-[#6b6762] mb-8 leading-relaxed">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
