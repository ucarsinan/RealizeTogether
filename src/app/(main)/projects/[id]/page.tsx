import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getProject } from "@/actions/project.actions"
import { checkNdaConsent } from "@/actions/nda.actions"
import { SynopsisViewer } from "@/components/trust-funnel/SynopsisViewer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Lock, Users, Play, ArrowLeft } from "lucide-react"
import { COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS, cn } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  idea:        "bg-purple-50 text-purple-700 border-purple-200",
  concept:     "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-amber-50 text-amber-700 border-amber-200",
  ready:       "bg-green-50 text-green-700 border-green-200",
  production:  "bg-orange-50 text-orange-700 border-orange-200",
  completed:   "bg-zinc-100 text-zinc-600 border-zinc-200",
}

type Params = Promise<{ id: string }>

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Explore
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STAGE_COLORS[project.stage] ?? STAGE_COLORS.idea}`}>
              {STAGE_LABELS[project.stage]}
            </span>
            <Badge variant="secondary" className="text-xs">{COMMITMENT_LABELS[project.commitment_type]}</Badge>
            <Badge variant="secondary" className="text-xs">{COLLAB_LABELS[project.collab_type]}</Badge>
            {project.requires_nda && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> NDA protected
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 leading-tight">{project.title}</h1>
            {project.logline && <p className="text-base text-zinc-500 mt-2 italic">"{project.logline}"</p>}
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={creator?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-zinc-100 text-sm">{creator?.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-800">{creator?.full_name}</span>
                {creator?.is_verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
              </div>
              <p className="text-xs text-zinc-400">Project creator</p>
            </div>
            {creator?.video_url && (
              <a href={creator.video_url} target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-full transition-all hover:border-zinc-400">
                <Play className="w-3 h-3" /> Intro video
              </a>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-medium text-zinc-700 mb-2">About the project</h2>
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-800">Roles needed</h2>
            </div>
            <div className="space-y-3">
              {roles.map(role => (
                <div key={role.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-zinc-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-800">{role.role_name}</span>
                      {role.quantity > 1 && <Badge variant="secondary" className="text-xs">×{role.quantity}</Badge>}
                    </div>
                    {role.description && <p className="text-xs text-zinc-500 mt-1">{role.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Funnel Level 2 */}
        {(project.synopsis_url || isOwner) && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-800">Synopsis / Pitch Deck</h2>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
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
        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-100 rounded-2xl text-xs text-zinc-500">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong className="text-zinc-700">Full script (Level 3):</strong>{" "}
            Shared privately in chat after a conversation — never stored on this platform.
          </span>
        </div>

        {/* Apply CTA */}
        {!isOwner && project.status === "open" && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
            <h2 className="text-sm font-medium text-zinc-800">Interested in collaborating?</h2>
            <p className="text-xs text-zinc-500">Read the synopsis first (if available), then apply.</p>
            {!user ? (
              <Link href={`/login?redirectTo=/projects/${project.id}`}>
                <Button className="w-full">Sign in to apply</Button>
              </Link>
            ) : (
              <Link href={`/projects/${project.id}/apply`}>
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800">I want to be part of this →</Button>
              </Link>
            )}
          </div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex gap-3">
            <Link href={`/projects/${project.id}/applications`} className="flex-1">
              <Button className="w-full">View Applications</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
