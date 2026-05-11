'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useUnreadCount } from '@/hooks/useUnreadCount'

type NavUser = { full_name: string; avatar_url: string | null } | null

const LogoSVG = () => (
  <svg viewBox="0 0 500 500" fill="none" width="28" height="28">
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

export function NavBar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser>(null)
  const unreadCount = useUnreadCount()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setUser(data ?? { full_name: user.user_metadata?.full_name ?? '?', avatar_url: null })
        })
    })
  }, [])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard')
    return pathname === href || pathname.startsWith(href + '/')
  }

  const navLinkClass = (href: string) =>
    `font-sans text-[13px] transition-colors duration-150 ${
      isActive(href) ? 'text-[#1a1918] font-medium' : 'text-[#6b6762] hover:text-[#1a1918]'
    }`

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#e0ddd8]"
      style={{ background: 'rgba(242,240,237,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-[1080px] mx-auto w-full px-10 max-md:px-5 h-[72px] flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <LogoSVG />
          <span className="font-unbounded font-bold text-[13px] tracking-[0.04em] text-[#1a1918] hidden sm:block">
            REALIZE TOGETHER
          </span>
        </Link>

        {/* Nav Links — hidden on mobile (BottomNav takes over) */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/explore" className={navLinkClass('/explore')}>
            Explore
          </Link>
          <Link href="/dashboard" className={navLinkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link
            href="/messages"
            className={`${navLinkClass('/messages')} relative inline-flex items-center gap-1.5`}
          >
            Messages
            {unreadCount > 0 && (
              <span className="min-w-[16px] h-4 bg-[#e8621a] rounded-full text-white text-[9px] flex items-center justify-center font-sans font-bold px-1 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Right: User or Auth Buttons */}
        {user ? (
          <Link href="/dashboard/profile" className="hidden md:block shrink-0">
            <Avatar className="w-8 h-8 ring-2 ring-[#e0ddd8] hover:ring-[#e8621a] transition-all">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] text-xs font-sans font-bold">
                {user?.full_name?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              href="/login"
              className="border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] text-[12px] md:text-[13px] px-3.5 py-1.5 md:px-5 md:py-2 rounded-full transition-colors duration-200 font-sans"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[12px] md:text-[13px] px-4 py-1.5 md:px-6 md:py-2.5 rounded-full transition-colors duration-150 font-sans"
            >
              Join free
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
