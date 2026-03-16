'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const unbounded = { fontFamily: '"Unbounded", sans-serif' }
  const dmSans = { fontFamily: '"DM Sans", sans-serif' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f2f0ed' }}>
      {/* ── Left panel ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 56px',
          width: '50%',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Decorative large background logo */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.06,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <LogoSVG size={500} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          {/* Wordmark */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 64,
              textDecoration: 'none',
            }}
          >
            <LogoSVG size={26} />
            <span
              style={{
                ...unbounded,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#1a1918',
              }}
            >
              Realize Together
            </span>
          </Link>

          {/* Kicker */}
          <p
            style={{
              ...dmSans,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#e8621a',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 20,
                height: 2,
                borderRadius: 2,
                background: '#e8621a',
              }}
            />
            Welcome back
          </p>

          {/* Headline */}
          <h1
            style={{
              ...unbounded,
              fontWeight: 900,
              fontSize: 'clamp(38px, 4.5vw, 66px)',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              color: '#1a1918',
              marginBottom: 24,
            }}
          >
            Log in to
            <br />
            <span style={{ color: '#e8621a' }}>your</span> account.
          </h1>

          {/* Subtext */}
          <p
            style={{
              ...dmSans,
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.8,
              color: '#6b6762',
              maxWidth: 380,
            }}
          >
            Your film team is waiting. Pick up where you left off and keep creating together.
          </p>

          {/* Bottom link */}
          <p style={{ ...dmSans, fontSize: 13, color: '#6b6762', marginTop: 48 }}>
            No account yet?{' '}
            <Link
              href="/register"
              style={{ color: '#e8621a', fontWeight: 500, textDecoration: 'none' }}
            >
              Join free →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderLeft: '1px solid #e0ddd8',
          padding: '48px 40px',
          width: '50%',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2
            style={{
              ...unbounded,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.03em',
              color: '#1a1918',
              marginBottom: 28,
            }}
          >
            Sign in
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  ...dmSans,
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#6b6762',
                  marginBottom: 6,
                }}
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
                style={{
                  ...dmSans,
                  width: '100%',
                  background: '#fff',
                  border: '1.5px solid #e0ddd8',
                  borderRadius: 100,
                  padding: '12px 20px',
                  fontSize: 13,
                  color: '#1a1918',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e8621a'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0ddd8'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  ...dmSans,
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#6b6762',
                  marginBottom: 6,
                }}
              >
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
                style={{
                  ...dmSans,
                  width: '100%',
                  background: '#fff',
                  border: '1.5px solid #e0ddd8',
                  borderRadius: 100,
                  padding: '12px 20px',
                  fontSize: 13,
                  color: '#1a1918',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e8621a'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0ddd8'
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  ...dmSans,
                  fontSize: 12,
                  color: '#dc2626',
                  background: '#fef2f2',
                  padding: '10px 16px',
                  borderRadius: 100,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...dmSans,
                width: '100%',
                background: loading ? '#c9521a' : '#e8621a',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                padding: '13px 24px',
                borderRadius: 100,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.background = '#c9521a'
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.background = '#e8621a'
              }}
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  Log in
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
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
