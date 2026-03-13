"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const LogoSVG = () => (
  <svg viewBox="0 0 500 500" fill="none" width="36" height="36">
    <path d="m 187.11765,18.563025 v 40 q 0,37.999995 38,37.999995 h 38 q 38,0 38,-37.999995 v -40" stroke="#e8621a" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="-248.63866" cy="167.71428" r="38" stroke="#e8621a" strokeWidth="18" transform="scale(-1,1)"/>
    <path d="m 306.57983,480.22689 v -40 q 0,-38 -38,-38 h -38 q -38,0 -38,38 v 40" stroke="#e8621a" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m 18.588235,308.84034 h 40 q 38,0 38,-38 v -38 q 0,-38 -38,-38 h -40" stroke="#e8621a" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="168" cy="250" r="38" stroke="#e8621a" strokeWidth="18"/>
    <circle cx="332" cy="250" r="38" stroke="#e8621a" strokeWidth="18"/>
    <path d="m 480.64367,307.33357 h -40.34356 q -38.32636,0 -38.32636,-38.22336 v -38.22337 q 0,-38.22335 38.32636,-38.22335 h 40.34356" stroke="#e8621a" strokeWidth="18.1299" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="248.50162" cy="332.65546" r="38" stroke="#e8621a" strokeWidth="18"/>
  </svg>
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-100">
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <LogoSVG />
        </div>

        {/* Kicker */}
        <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] text-center mb-2">
          WELCOME BACK
        </p>

        {/* H2 */}
        <h2 className="font-['Unbounded'] font-bold text-[clamp(20px,2.5vw,36px)] tracking-[-0.03em] text-[#1a1918] text-center mb-7">
          Log in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-1.5">
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
            <label htmlFor="password" className="block font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-['DM_Sans']"
            />
          </div>

          {error && (
            <p className="font-['DM_Sans'] text-[12px] text-red-600 bg-red-50 px-4 py-2 rounded-full">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors duration-150 font-['DM_Sans'] disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="text-center font-['DM_Sans'] text-[13px] text-[#6b6762] mt-5">
        No account yet?{" "}
        <Link href="/register" className="text-[#e8621a] font-medium hover:text-[#c9521a] transition-colors">
          Join free
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
