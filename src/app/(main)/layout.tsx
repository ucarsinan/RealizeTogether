import { NavBar } from '@/components/layout/NavBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f2f0ed]">
      <NavBar />
      <main className="flex flex-col flex-1 pt-18 pb-15 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
