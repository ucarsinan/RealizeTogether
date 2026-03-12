import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Film, Users, Lock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <span className="text-sm font-semibold text-zinc-900 tracking-tight">Realize Together</span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-zinc-600 text-sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center space-y-8">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl font-semibold text-zinc-900 leading-tight tracking-tight">
            Find the right people<br />to realize your project
          </h1>
          <p className="text-base text-zinc-500 leading-relaxed">
            Realize Together connects film makers, writers, directors, and creatives
            who want to build something meaningful — together.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link href="/register">
            <Button className="bg-zinc-900 hover:bg-zinc-800 gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="text-zinc-700">Browse projects</Button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-24 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2">
          <Film className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-medium text-zinc-800">Film &amp; Creative Projects</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Share your idea, logline, or full concept — at whatever stage you&apos;re at.</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2">
          <Users className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-medium text-zinc-800">Role-based matching</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">List the exact roles you need. Applicants apply with their skills and portfolio.</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2">
          <Lock className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-medium text-zinc-800">Trust Funnel</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Share sensitive material step by step — synopsis behind NDA, full script only in chat.</p>
        </div>
      </section>

    </div>
  )
}
