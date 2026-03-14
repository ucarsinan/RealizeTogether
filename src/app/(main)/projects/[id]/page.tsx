import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/actions/project.actions'
import { checkNdaConsent } from '@/actions/nda.actions'
import { SynopsisViewer } from '@/components/trust-funnel/SynopsisViewer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, Lock, Users, Play } from 'lucide-react'
import { COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS } from '@/lib/utils'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

const STAGE_COLORS: Record<string, string> = {
  idea: 'bg-[#fdf2ec] text-[#e8621a] border-[#e8621a]/20',
  concept: 'bg-blue-50 text-blue-700 border-blue-200',
  development: 'bg-amber-50 text-amber-700 border-amber-200',
  ready: 'bg-green-50 text-green-700 border-green-200',
  production: 'bg-[#fdf2ec] text-[#e8621a] border-[#e8621a]/30',
  completed: 'bg-[#f2f0ed] text-[#6b6762] border-[#e0ddd8]',
}

type Params = Promise<{ id: string }>

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getProject(id)
  if (!result.success) notFound()

  const project = result.data
  const creator = project.profiles
  const roles = project.project_roles ?? []
  const isOwner = user?.id === project.creator_id

  let initialHasConsented = false
  if (user && project.requires_nda) {
    const consentResult = await checkNdaConsent(project.id)
    initialHasConsented = consentResult.success && consentResult.data.hasConsented
  }

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10 space-y-6">
        <Breadcrumb items={[{ label: 'Explore', href: '/explore' }, { label: project.title }]} />

        {/* Header card */}
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-['DM_Sans'] text-[11px] font-medium px-3 py-1 rounded-full border ${STAGE_COLORS[project.stage] ?? STAGE_COLORS.idea}`}
            >
              {STAGE_LABELS[project.stage]}
            </span>
            <span className="font-['DM_Sans'] text-[11px] font-medium px-3 py-1 rounded-full bg-[#f2f0ed] text-[#6b6762]">
              {COMMITMENT_LABELS[project.commitment_type]}
            </span>
            <span className="font-['DM_Sans'] text-[11px] font-medium px-3 py-1 rounded-full bg-[#f2f0ed] text-[#6b6762]">
              {COLLAB_LABELS[project.collab_type]}
            </span>
            {project.requires_nda && (
              <span className="font-['DM_Sans'] text-[11px] text-[#6b6762] flex items-center gap-1">
                <Lock className="w-3 h-3" /> NDA protected
              </span>
            )}
          </div>

          {/* Category kicker */}
          {project.category && (
            <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a]">
              {project.category}
            </p>
          )}

          {/* Title + logline */}
          <div>
            <h1 className="font-['Unbounded'] font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
              {project.title}
            </h1>
            {project.logline && (
              <p className="font-['DM_Sans'] text-[15px] text-[#6b6762] mt-3 italic leading-relaxed">
                &ldquo;{project.logline}&rdquo;
              </p>
            )}
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-[#e0ddd8]">
              <AvatarImage src={creator?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] text-sm font-['DM_Sans'] font-bold">
                {creator?.full_name?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['DM_Sans'] text-[13px] font-medium text-[#1a1918]">
                  {creator?.full_name}
                </span>
                {creator?.is_verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
              </div>
              <p className="font-['DM_Sans'] text-[11px] text-[#6b6762]">Project creator</p>
            </div>
            {creator?.video_url && (
              <a
                href={creator.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 font-['DM_Sans'] text-[12px] text-[#6b6762] hover:text-[#1a1918] border border-[#e0ddd8] hover:border-[#1a1918] px-3 py-1.5 rounded-full transition-colors"
              >
                <Play className="w-3 h-3" /> Intro video
              </a>
            )}
          </div>

          <div className="border-t border-[#e0ddd8]" />

          {/* Description */}
          <div>
            <h2 className="font-['DM_Sans'] text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-3">
              About the project
            </h2>
            <p className="font-['DM_Sans'] text-[14px] text-[#1a1918] leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
        </div>

        {/* Roles card */}
        {roles.length > 0 && (
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e8621a]" />
              <h2 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
                Roles needed
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#f2f0ed] border border-[#e0ddd8]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['DM_Sans'] text-[13px] font-medium text-[#1a1918]">
                        {role.role_name}
                      </span>
                      {role.quantity > 1 && (
                        <span className="font-['DM_Sans'] text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#e0ddd8] text-[#6b6762]">
                          ×{role.quantity}
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="font-['DM_Sans'] text-[12px] text-[#6b6762] mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                  {!isOwner && project.status === 'open' && user && (
                    <Link
                      href={`/projects/${project.id}/apply`}
                      className="bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[11px] px-3 py-1.5 rounded-full transition-colors duration-150 font-['DM_Sans'] shrink-0"
                    >
                      Apply
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Funnel Level 2 */}
        {(project.synopsis_url || isOwner) && (
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
                Synopsis / Pitch Deck
              </h2>
              <span className="font-['DM_Sans'] text-[11px] text-[#6b6762] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Trust Funnel Level 2
              </span>
            </div>
            <SynopsisViewer
              projectId={project.id}
              projectTitle={project.title}
              requiresNda={project.requires_nda}
              hasSynopsis={!!project.synopsis_url}
              initialHasConsented={initialHasConsented}
              isOwner={isOwner}
            />
          </div>
        )}

        {/* Level 3 hint */}
        <div className="flex items-start gap-3 px-5 py-4 bg-white border border-[#e0ddd8] rounded-2xl font-['DM_Sans'] text-[12px] text-[#6b6762]">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#6b6762]" />
          <span>
            <strong className="text-[#1a1918] font-medium">Full script (Level 3):</strong> Shared
            privately in chat after a conversation — never stored on this platform.
          </span>
        </div>

        {/* Apply CTA */}
        {!isOwner && project.status === 'open' && (
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-4">
            <h2 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918]">
              Interested in collaborating?
            </h2>
            <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">
              Read the synopsis first (if available), then apply.
            </p>
            {!user ? (
              <Link
                href={`/login?redirectTo=/projects/${project.id}`}
                className="inline-block bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors duration-150 font-['DM_Sans']"
              >
                Sign in to apply
              </Link>
            ) : (
              <Link
                href={`/projects/${project.id}/apply`}
                className="inline-block bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors duration-150 font-['DM_Sans']"
              >
                I want to be part of this →
              </Link>
            )}
          </div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex gap-3">
            <Link
              href={`/projects/${project.id}/applications`}
              className="flex-1 text-center bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors duration-150 font-['DM_Sans']"
            >
              View Applications
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
