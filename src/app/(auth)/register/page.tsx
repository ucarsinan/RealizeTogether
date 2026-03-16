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

  const unbounded = { fontFamily: '"Unbounded", sans-serif' }
  const dmSans = { fontFamily: '"DM Sans", sans-serif' }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
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
      <div
        style={{
          minHeight: '100vh',
          background: '#f2f0ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e0ddd8',
              borderRadius: 20,
              padding: '40px 32px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <LogoSVG size={36} />
            </div>
            <h2
              style={{
                ...unbounded,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.02em',
                color: '#1a1918',
                marginBottom: 12,
              }}
            >
              Check your email
            </h2>
            <p style={{ ...dmSans, fontSize: 13, color: '#6b6762', lineHeight: 1.7 }}>
              We sent a confirmation link to <strong style={{ color: '#1a1918' }}>{email}</strong>.
              Click it and you&apos;ll be taken straight to your profile setup.
            </p>
          </div>
          <Link
            href="/login"
            style={{
              ...dmSans,
              fontSize: 13,
              color: '#6b6762',
              marginTop: 20,
              display: 'inline-block',
              textDecoration: 'none',
            }}
          >
            ← Back to log in
          </Link>
        </div>
      </div>
    )
  }

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
        {/* Decorative background logo */}
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
            Join the community
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
            Find your
            <br />
            <span style={{ color: '#e8621a' }}>film</span> team.
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
            Connect with directors, writers, DPs and producers. Build trust and create something
            real.
          </p>

          {/* Bottom link */}
          <p style={{ ...dmSans, fontSize: 13, color: '#6b6762', marginTop: 48 }}>
            Already a member?{' '}
            <Link
              href="/login"
              style={{ color: '#e8621a', fontWeight: 500, textDecoration: 'none' }}
            >
              Log in →
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
          overflowY: 'auto',
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
            Create your profile
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                style={{
                  ...dmSans,
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#6b6762',
                  marginBottom: 6,
                }}
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
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e8621a'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0ddd8'
                }}
              />
            </div>

            {/* Email */}
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
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e8621a'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0ddd8'
                }}
              />
            </div>

            {/* Password */}
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e8621a'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0ddd8'
                }}
              />
            </div>

            {/* Role selection */}
            <div>
              <p
                style={{
                  ...dmSans,
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#6b6762',
                  marginBottom: 8,
                }}
              >
                Your role <span style={{ color: '#bab7b2', fontWeight: 400 }}>(optional)</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                    style={{
                      ...dmSans,
                      fontSize: 12,
                      padding: '9px 6px',
                      borderRadius: 100,
                      border: '1.5px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: selectedRole === role ? '#e8621a' : '#fff',
                      borderColor: selectedRole === role ? '#e8621a' : '#e0ddd8',
                      color: selectedRole === role ? '#fff' : '#6b6762',
                      fontWeight: selectedRole === role ? 700 : 400,
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
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
                background: '#e8621a',
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
              }}
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
        </div>
      </div>
    </div>
  )
}
