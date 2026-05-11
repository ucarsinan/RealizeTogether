'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Compass, MessageCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUnreadCount } from '@/hooks/useUnreadCount'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: Home },
  { href: '/explore', label: 'Explore', Icon: Compass },
  { href: '/messages', label: 'Messages', Icon: MessageCircle },
  { href: '/dashboard/profile', label: 'Profile', Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState(false)
  const unreadCount = useUnreadCount()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuth(!!user)
    })
  }, [])

  if (!isAuth) return null

  function isActive(href: string) {
    if (href === '/dashboard')
      return (
        pathname === '/dashboard' ||
        (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/profile'))
      )
    if (href === '/dashboard/profile') return pathname.startsWith('/dashboard/profile')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#e0ddd8] pb-[env(safe-area-inset-bottom)]"
      style={{ background: 'rgba(242,240,237,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          const isMessages = href === '/messages'
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-colors duration-150"
                  style={{ color: active ? '#e8621a' : '#9b978f' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 bg-[#e8621a] rounded-full text-white text-[8px] flex items-center justify-center font-sans font-bold px-0.5 leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className="font-sans text-[10px] font-medium transition-colors duration-150"
                style={{ color: active ? '#e8621a' : '#9b978f' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
