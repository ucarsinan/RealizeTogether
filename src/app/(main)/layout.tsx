import { NavBar } from "@/components/layout/NavBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex flex-col flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
