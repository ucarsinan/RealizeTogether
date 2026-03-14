'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const LogoSVG = () => (
  <svg viewBox="0 0 500 500" fill="none" width="36" height="36">
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
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
      <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center px-4">
        <div className="w-full max-w-100 text-center">
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-3">
            <div className="flex justify-center mb-4">
              <LogoSVG />
            </div>
            <h2 className="font-['Unbounded'] font-bold text-[18px] tracking-[-0.02em] text-[#1a1918]">
              Check your email
            </h2>
            <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">
              We sent a confirmation link to <strong className="text-[#1a1918]">{email}</strong>.
              Click it and you&apos;ll be taken straight to your profile setup.
            </p>
          </div>
          <Link
            href="/login"
            className="font-['DM_Sans'] text-[13px] text-[#6b6762] hover:text-[#1a1918] transition-colors mt-5 inline-block"
          >
            Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-100">
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <LogoSVG />
          </div>

          {/* Kicker */}
          <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] text-center mb-2">
            JOIN THE COMMUNITY
          </p>

          {/* H2 */}
          <h2 className="font-['Unbounded'] font-bold text-[clamp(20px,2.5vw,36px)] tracking-[-0.03em] text-[#1a1918] text-center mb-7">
            Create your profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-1.5"
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
                className="w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-['DM_Sans']"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-1.5"
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
                className="w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-['DM_Sans']"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-1.5"
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
                className="w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-['DM_Sans']"
              />
            </div>

            {/* Role selection */}
            <div>
              <p className="font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-2">
                Your role <span className="text-[#bab7b2] font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                    className={`font-['DM_Sans'] text-[12px] px-3 py-2 rounded-full border transition-colors duration-150 ${
                      selectedRole === role
                        ? 'bg-[#e8621a] border-[#e8621a] text-white font-bold'
                        : 'border-[#e0ddd8] text-[#6b6762] hover:border-[#1a1918] hover:text-[#1a1918]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-['DM_Sans'] text-[12px] text-red-600 bg-red-50 px-4 py-2 rounded-full">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors duration-150 font-['DM_Sans'] disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account…' : "Get started — it's free"}
            </button>
          </form>
        </div>

        <p className="text-center font-['DM_Sans'] text-[13px] text-[#6b6762] mt-5">
          Already a member?{' '}
          <Link
            href="/login"
            className="text-[#e8621a] font-medium hover:text-[#c9521a] transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
