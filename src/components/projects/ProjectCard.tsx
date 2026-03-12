import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, CheckCircle } from "lucide-react"
import type { ProjectWithRoles } from "@/lib/types"
import { COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  idea:        "bg-purple-50 text-purple-700 border-purple-200",
  concept:     "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-amber-50 text-amber-700 border-amber-200",
  ready:       "bg-green-50 text-green-700 border-green-200",
  production:  "bg-orange-50 text-orange-700 border-orange-200",
  completed:   "bg-zinc-100 text-zinc-600 border-zinc-200",
}

const COMMITMENT_COLORS: Record<string, string> = {
  hobby:        "bg-zinc-100 text-zinc-600",
  side_project: "bg-blue-50 text-blue-700",
  serious:      "bg-amber-50 text-amber-700",
  professional: "bg-green-50 text-green-700",
}

export function ProjectCard({ project }: { project: ProjectWithRoles }) {
  const creator = project.profiles
  const roles = project.project_roles ?? []

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-400 hover:shadow-sm transition-all group">

        {/* Top Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STAGE_COLORS[project.stage] ?? STAGE_COLORS.idea}`}>
                {STAGE_LABELS[project.stage]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${COMMITMENT_COLORS[project.commitment_type] ?? ""}`}>
                {COMMITMENT_LABELS[project.commitment_type]}
              </span>
              {project.requires_nda && (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  NDA
                </span>
              )}
            </div>

            <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate">
              {project.title}
            </h3>

            {project.logline && (
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                {project.logline}
              </p>
            )}
          </div>

          {/* Creator Avatar */}
          {creator && (
            <div className="shrink-0 flex flex-col items-center gap-1">
              <Avatar className="w-9 h-9">
                <AvatarImage src={creator.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-zinc-100">
                  {creator.full_name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              {creator.is_verified && (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {roles.slice(0, 4).map(role => (
              <Badge
                key={role.id}
                variant="secondary"
                className="text-xs bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              >
                {role.quantity > 1 ? `${role.quantity}× ` : ""}{role.role_name}
              </Badge>
            ))}
            {roles.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-zinc-100 text-zinc-500">
                +{roles.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Bottom */}
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
          <span>{creator?.full_name}</span>
          <span>{COLLAB_LABELS[project.collab_type]}</span>
        </div>
      </div>
    </Link>
  )
}
