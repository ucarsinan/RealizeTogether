import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dsmzvqaevqbygefuqeno.supabase.co',
      },
    ],
  },
  async headers() {
    const supabaseHost = 'dsmzvqaevqbygefuqeno.supabase.co'

    const csp = [
      "default-src 'self'",
      // Next.js requires unsafe-inline for its runtime scripts & styles
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: https://${supabaseHost}`,
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "font-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
