"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Compass, LayoutDashboard, MessageCircle, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

type NavUser = { full_name: string; avatar_url: string | null } | null

export function NavBar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setUser(data ?? { full_name: user.user_metadata?.full_name ?? "?", avatar_url: null })
        })
    })
  }, [])

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard")
    return pathname === href || pathname.startsWith(href + "/")
  }

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      isActive(href) ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"
    }`

  const mobileLinkClass = (href: string) =>
    `flex flex-col items-center gap-0.5 text-xs transition-colors ${
      isActive(href) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
    }`

  return (
    <>
      {/* ── DESKTOP: sticky top ── */}
      <nav className="max-md:hidden flex sticky top-0 z-50 w-full bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto w-full px-4 h-14 flex items-center justify-between">

          <Link href="/dashboard" className="text-sm font-semibold text-zinc-900 tracking-tight shrink-0">
            Realize Together
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/explore" className={linkClass("/explore")}>Explore</Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            <Link href="/messages" className={linkClass("/messages")}>Messages</Link>
          </div>

          <Link href="/dashboard/profile" className="shrink-0">
            <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-zinc-200 transition">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-zinc-100 text-xs">
                {user?.full_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </Link>

        </div>
      </nav>

      {/* ── MOBILE: fixed bottom ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-zinc-100">
        <div className="h-16 flex items-center justify-around px-4">

          <Link href="/explore" className={mobileLinkClass("/explore")}>
            <Compass className="w-5 h-5" />
            Explore
          </Link>

          <Link href="/dashboard" className={mobileLinkClass("/dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link href="/messages" className={mobileLinkClass("/messages")}>
            <MessageCircle className="w-5 h-5" />
            Messages
          </Link>

          <Link href="/dashboard/profile" className={mobileLinkClass("/dashboard/profile")}>
            {user?.avatar_url ? (
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-zinc-100 text-[10px]">
                  {user.full_name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="w-5 h-5" />
            )}
            Profile
          </Link>

        </div>
      </nav>
    </>
  )
}
