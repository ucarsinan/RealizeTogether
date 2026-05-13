'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const LogoSVG = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 500 500" fill="none" width={size} height={size}>
    <path
      d="m 187.11765,18.563025 v 40 q 0,37.999995 38,37.999995 h 38 q 38,0 38,-37.999995 v -40"
      stroke="#e8621a"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="-248.63866"
      cy="167.71428"
      r="38"
      stroke="#e8621a"
      strokeWidth="18"
      transform="scale(-1,1)"
    />
    <path
      d="m 306.57983,480.22689 v -40 q 0,-38 -38,-38 h -38 q -38,0 -38,38 v 40"
      stroke="#e8621a"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m 18.588235,308.84034 h 40 q 38,0 38,-38 v -38 q 0,-38 -38,-38 h -40"
      stroke="#e8621a"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="168" cy="250" r="38" stroke="#e8621a" strokeWidth="18" />
    <circle cx="332" cy="250" r="38" stroke="#e8621a" strokeWidth="18" />
    <path
      d="m 480.64367,307.33357 h -40.34356 q -38.32636,0 -38.32636,-38.22336 v -38.22337 q 0,-38.22335 38.32636,-38.22335 h 40.34356"
      stroke="#e8621a"
      strokeWidth="18.1299"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="248.50162" cy="332.65546" r="38" stroke="#e8621a" strokeWidth="18" />
  </svg>
)

const ROLES = ['Director', 'Writer', 'DP', 'Producer', 'Editor', 'Other']

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleResend() {
    setResendStatus('sending')
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setResendStatus('sent')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(selectedRole ? { role: selectedRole } : {}),
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-110 text-center">
          <div className="bg-white border border-[#e0ddd8] rounded-[20px] px-8 py-10 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
            <div className="flex justify-center mb-4">
              <LogoSVG size={36} />
            </div>
            <h2 className="font-unbounded font-bold text-[18px] tracking-[-0.02em] text-[#1a1918] mb-3">
              Check your email
            </h2>
            <p className="font-sans text-[13px] text-[#6b6762] leading-[1.7]">
              We sent a confirmation link to <strong className="text-[#1a1918]">{email}</strong>.
              Click it and you&apos;ll be taken straight to your profile setup.
            </p>
            <div className="mt-5 pt-5 border-t border-[#e0ddd8]">
              {resendStatus === 'sent' ? (
                <p className="font-sans text-[12px] text-[#e8621a]">
                  Email sent — check your inbox again.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                  className="font-sans text-[12px] text-[#6b6762] hover:text-[#e8621a] disabled:opacity-60 transition-colors"
                >
                  {resendStatus === 'sending' ? 'Sending…' : "Didn't receive it? Resend email →"}
                </button>
              )}
            </div>
          </div>
          <Link href="/login" className="font-sans text-[13px] text-[#6b6762] mt-5 inline-block">
            ← Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f2f0ed]">
      {/* ── Left panel (Marketing) — hidden on mobile ── */}
      <div className="hidden md:flex relative flex-col justify-center px-14 py-16 w-1/2 overflow-hidden shrink-0">
        {/* Decorative background logo */}
        <div className="absolute -right-15 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none">
          <LogoSVG size={500} />
        </div>

        <div className="relative z-10 max-w-120">
          {/* Wordmark */}
          <Link href="/" className="inline-flex items-center gap-2 mb-16 no-underline">
            <LogoSVG size={26} />
            <span className="font-unbounded text-[11px] font-bold tracking-[0.12em] uppercase text-[#1a1918]">
              Realize Together
            </span>
          </Link>

          {/* Kicker */}
          <p className="font-sans flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase text-[#e8621a] mb-5">
            <span className="inline-block w-5 h-0.5 rounded-sm bg-[#e8621a]" />
            Join the community
          </p>

          {/* Headline */}
          <h1 className="font-unbounded font-black text-[clamp(38px,4.5vw,66px)] leading-[0.92] tracking-[-0.04em] text-[#1a1918] mb-6">
            Find your
            <br />
            <span className="text-[#e8621a]">film</span> team.
          </h1>

          {/* Subtext */}
          <p className="font-sans text-[15px] font-light leading-[1.8] text-[#6b6762] max-w-95">
            Connect with directors, writers, DPs and producers. Build trust and create something
            real.
          </p>

          {/* Bottom link */}
          <p className="font-sans text-[13px] text-[#6b6762] mt-12">
            Already a member?{' '}
            <Link href="/login" className="text-[#e8621a] font-medium no-underline">
              Log in →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel (Form) ── */}
      <div className="flex flex-col items-center justify-center bg-white border-l border-[#e0ddd8] px-6 py-12 md:px-10 md:py-16 w-full md:w-1/2 shrink-0 overflow-y-auto">
        <div className="w-full max-w-100">
          {/* Mobile-only logo */}
          <div className="flex flex-col items-center mb-10 md:hidden">
            <Link href="/" className="flex flex-col items-center gap-3 mb-2">
              <LogoSVG size={64} />
              <span className="font-unbounded text-[13px] font-bold tracking-[0.12em] uppercase text-[#1a1918]">
                Realize Together
              </span>
            </Link>
          </div>

          <h2 className="font-unbounded font-bold text-[22px] tracking-[-0.03em] text-[#1a1918] mb-7">
            Create your profile
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="font-sans w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-3 text-[13px] text-[#1a1918] outline-none transition-colors duration-200"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="font-sans w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-3 text-[13px] text-[#1a1918] outline-none transition-colors duration-200"
              />
            </div>

            {/* Role selection */}
            <div>
              <p className="font-sans text-[12px] font-medium text-[#6b6762] mb-2">
                Your role <span className="text-[#bab7b2] font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                    className={`font-sans text-[12px] py-2.5 px-1.5 rounded-full border-[1.5px] cursor-pointer transition-all duration-150 ${
                      selectedRole === role
                        ? 'bg-[#e8621a] border-[#e8621a] text-white font-bold'
                        : 'bg-white border-[#e0ddd8] text-[#6b6762] hover:border-[#1a1918]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
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
              {loading ? (
                'Creating account…'
              ) : (
                <>
                  Get started — it&apos;s free
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
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Mobile-only login link */}
          <p className="font-sans text-[13px] text-[#6b6762] text-center mt-8 md:hidden">
            Already a member?{' '}
            <Link href="/login" className="text-[#e8621a] font-medium">
              Log in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
