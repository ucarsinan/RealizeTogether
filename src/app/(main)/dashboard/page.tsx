import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyProjects } from '@/actions/project.actions'
import { getMyApplications } from '@/actions/application.actions'
import { STAGE_LABELS, COMMITMENT_LABELS } from '@/lib/utils'
import { Plus, MessageCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projectsResult, applicationsResult] = await Promise.all([
    getMyProjects(),
    getMyApplications(),
  ])

  const projects = projectsResult.success ? projectsResult.data : []
  const applications = applicationsResult.success ? applicationsResult.data : []

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  const inTalksIds = applications.filter((a) => a.status === 'in_talks').map((a) => a.id)
  const convMap: Record<string, string> = {}
  if (inTalksIds.length > 0) {
    const { data: convData } = await supabase
      .from('conversations')
      .select('id, application_id')
      .in('application_id', inTalksIds)
    for (const c of convData ?? []) convMap[c.application_id] = c.id
  }

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-[1080px] mx-auto px-10 max-md:px-5 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            YOUR DASHBOARD
          </p>
          <h1 className="font-['Unbounded'] font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Welcome back, {firstName}.
          </h1>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Your Projects */}
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
                Your Projects
              </h3>
              <Link
                href="/projects/new"
                className="flex items-center gap-1.5 bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[11px] px-3 py-1.5 rounded-full transition-colors duration-150 font-['DM_Sans']"
              >
                <Plus className="w-3 h-3" />
                New
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-3">
                <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">No projects yet.</p>
                <Link
                  href="/projects/new"
                  className="bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[12px] px-4 py-2 rounded-full transition-colors duration-150 font-['DM_Sans']"
                >
                  Create first project
                </Link>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="border border-[#e0ddd8] hover:border-[#e8621a] rounded-xl p-3 transition-colors group">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-['DM_Sans'] text-[13px] font-medium text-[#1a1918] leading-snug group-hover:text-[#e8621a] transition-colors truncate">
                          {project.title}
                        </h4>
                        <span className="font-['DM_Sans'] text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f2f0ed] text-[#6b6762] shrink-0 capitalize">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-['DM_Sans'] text-[11px] text-[#6b6762]">
                          {STAGE_LABELS[project.stage]}
                        </span>
                        <span className="text-[#e0ddd8]">·</span>
                        <span className="font-['DM_Sans'] text-[11px] text-[#6b6762]">
                          {COMMITMENT_LABELS[project.commitment_type]}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/explore"
              className="text-center border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] text-[12px] px-4 py-2 rounded-full transition-colors duration-200 font-['DM_Sans'] mt-auto"
            >
              Explore projects
            </Link>
          </div>

          {/* Your Applications */}
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col gap-4">
            <h3 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
              Your Applications
            </h3>

            {applications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">No applications yet.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {applications.map((app) => {
                  const convId = convMap[app.id]
                  return (
                    <div key={app.id} className="border border-[#e0ddd8] rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/projects/${app.project_id}`} className="flex-1 min-w-0">
                          <h4 className="font-['DM_Sans'] text-[13px] font-medium text-[#1a1918] leading-snug hover:text-[#e8621a] transition-colors truncate">
                            {app.projects?.title ?? 'Project'}
                          </h4>
                        </Link>
                        <StatusBadge status={app.status} />
                      </div>
                      {app.project_roles?.role_name && (
                        <p className="font-['DM_Sans'] text-[11px] text-[#6b6762]">
                          Role: {app.project_roles.role_name}
                        </p>
                      )}
                      {convId && (
                        <Link
                          href={`/messages/${convId}`}
                          className="inline-flex items-center gap-1.5 border border-[#e0ddd8] hover:border-[#e8621a] text-[#6b6762] hover:text-[#e8621a] text-[11px] px-3 py-1 rounded-full transition-colors font-['DM_Sans']"
                        >
                          <MessageCircle className="w-3 h-3" /> Open Chat
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col gap-4">
            <h3 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
              Messages
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-3">
              <MessageCircle className="w-8 h-8 text-[#e0ddd8]" />
              <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">
                Conversations appear once an application is accepted.
              </p>
            </div>

            <Link
              href="/messages"
              className="text-center border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] text-[12px] px-4 py-2 rounded-full transition-colors duration-200 font-['DM_Sans'] mt-auto"
            >
              View all messages
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/profile"
            className="border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] text-[13px] px-5 py-2 rounded-full transition-colors duration-200 font-['DM_Sans']"
          >
            Edit profile
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-[#f2f0ed] text-[#6b6762]',
    in_talks: 'bg-[#fdf2ec] text-[#e8621a]',
    matched: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-600',
  }
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_talks: 'In talks',
    matched: 'Matched',
    rejected: 'Rejected',
  }
  return (
    <span
      className={`font-['DM_Sans'] text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${styles[status] ?? styles.pending}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
