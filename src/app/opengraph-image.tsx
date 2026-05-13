import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Realize Together — Find Your Film Team & Crew'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#1a1918',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        position: 'relative',
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: '50%',
          marginTop: -400,
          width: 800,
          height: 800,
          borderRadius: '50%',
          border: '1.5px solid rgba(232,98,26,0.12)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -40,
          top: '50%',
          marginTop: -300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          border: '1.5px solid rgba(232,98,26,0.08)',
          display: 'flex',
        }}
      />

      {/* Logo + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg viewBox="0 0 500 500" width={44} height={44} fill="none">
          <path
            d="m 187.11765,18.563025 v 40 q 0,37.999995 38,37.999995 h 38 q 38,0 38,-37.999995 v -40"
            stroke="#e8621a"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="251.36134" cy="167.71428" r="38" stroke="#e8621a" strokeWidth="18" />
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
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          REALIZE TOGETHER
        </span>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#e8621a',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 20,
              height: 2,
              background: '#e8621a',
              borderRadius: 2,
              display: 'flex',
            }}
          />
          Find your film team
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            maxWidth: 700,
          }}
        >
          Build trust.{'\n'}
          <span style={{ color: '#e8621a' }}>Create</span> together.
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            lineHeight: 1.6,
            color: '#9b9690',
            fontFamily: 'sans-serif',
            maxWidth: 560,
            marginTop: 8,
          }}
        >
          NDA-protected pitches. Verified portfolios. Double opt-in matching.
        </div>
      </div>

      {/* Bottom URL */}
      <div
        style={{
          fontSize: 15,
          color: '#6b6762',
          fontFamily: 'sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        realizetogether.com
      </div>
    </div>,
    { ...size }
  )
}
