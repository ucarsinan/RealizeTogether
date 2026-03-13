import { NavBar } from "@/components/layout/NavBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f2f0ed]">
      <NavBar />
      <main className="flex flex-col flex-1 pt-18">
        {children}
      </main>
    </div>
  )
}
