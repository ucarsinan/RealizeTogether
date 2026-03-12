import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMyProjects } from "@/actions/project.actions"
import { getMyApplications } from "@/actions/application.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STAGE_LABELS, COMMITMENT_LABELS } from "@/lib/utils"
import { Plus, FolderOpen, Send, MessageCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [projectsResult, applicationsResult] = await Promise.all([
    getMyProjects(),
    getMyApplications(),
  ])

  const projects = projectsResult.success ? projectsResult.data : []
  const applications = applicationsResult.success ? applicationsResult.data : []

  // Get conversation IDs for in_talks applications
  const inTalksIds = applications.filter(a => a.status === "in_talks").map(a => a.id)
  const convMap: Record<string, string> = {}
  if (inTalksIds.length > 0) {
    const { data: convData } = await supabase
      .from("conversations")
      .select("id, application_id")
      .in("application_id", inTalksIds)
    for (const c of (convData ?? [])) convMap[c.application_id] = c.id
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Quick Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/messages">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5" /> Messages
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="text-xs">Explore projects</Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="text-xs">Edit profile</Button>
          </Link>
        </div>

        {/* My Projects */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-800">My Projects</h2>
            </div>
            <Link href="/projects/new">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> New project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center space-y-3">
              <p className="text-sm text-zinc-500">You haven&apos;t created any projects yet.</p>
              <Link href="/projects/new">
                <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800">Create your first project</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-white rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-zinc-900 leading-snug">{project.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0 capitalize">{project.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-zinc-400">{STAGE_LABELS[project.stage]}</span>
                      <span className="text-zinc-200">·</span>
                      <span className="text-xs text-zinc-400">{COMMITMENT_LABELS[project.commitment_type]}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* My Applications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-800">My Applications</h2>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center">
              <p className="text-sm text-zinc-500">You haven&apos;t applied to any projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const convId = convMap[app.id]
                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/projects/${app.project_id}`} className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-zinc-900 leading-snug hover:underline">
                          {app.projects?.title ?? "Project"}
                        </h3>
                      </Link>
                      <StatusBadge status={app.status} />
                    </div>
                    {app.project_roles?.role_name && (
                      <p className="text-xs text-zinc-400">Role: {app.project_roles.role_name}</p>
                    )}
                    {convId && (
                      <Link href={`/messages/${convId}`}>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-1">
                          <MessageCircle className="w-3 h-3" /> Open Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:  "bg-zinc-100 text-zinc-600",
    in_talks: "bg-blue-50 text-blue-700",
    matched:  "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-600",
  }
  const labels: Record<string, string> = {
    pending:  "Pending",
    in_talks: "In talks",
    matched:  "Matched",
    rejected: "Rejected",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  )
}
