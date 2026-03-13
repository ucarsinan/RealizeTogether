import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, CheckCircle } from "lucide-react"
import type { ProjectWithRoles } from "@/lib/types"
import { COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  idea:        "bg-[#fdf2ec] text-[#e8621a] border-[#e8621a]/20",
  concept:     "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-amber-50 text-amber-700 border-amber-200",
  ready:       "bg-green-50 text-green-700 border-green-200",
  production:  "bg-[#fdf2ec] text-[#e8621a] border-[#e8621a]/30",
  completed:   "bg-[#f2f0ed] text-[#6b6762] border-[#e0ddd8]",
}

export function ProjectCard({ project }: { project: ProjectWithRoles }) {
  const creator = project.profiles
  const roles = project.project_roles ?? []

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-5 hover:border-[#e8621a] hover:shadow-[0_4px_24px_rgba(232,98,26,0.10)] transition-all duration-200 group h-full flex flex-col">

        {/* Top Row */}
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`font-['DM_Sans'] text-[10px] font-medium px-2.5 py-1 rounded-full border ${STAGE_COLORS[project.stage] ?? STAGE_COLORS.idea}`}>
                {STAGE_LABELS[project.stage]}
              </span>
              <span className="font-['DM_Sans'] text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#f2f0ed] text-[#6b6762]">
                {COMMITMENT_LABELS[project.commitment_type]}
              </span>
              {project.requires_nda && (
                <span className="font-['DM_Sans'] text-[10px] text-[#6b6762] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  NDA
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-['Unbounded'] font-bold text-[14px] tracking-[-0.01em] text-[#1a1918] group-hover:text-[#e8621a] transition-colors truncate">
              {project.title}
            </h3>

            {/* Logline */}
            {project.logline && (
              <p className="font-['DM_Sans'] text-[12px] text-[#6b6762] mt-1.5 line-clamp-2 leading-relaxed">
                {project.logline}
              </p>
            )}
          </div>

          {/* Creator Avatar */}
          {creator && (
            <div className="shrink-0 flex flex-col items-center gap-1">
              <Avatar className="w-9 h-9 ring-2 ring-[#e0ddd8] group-hover:ring-[#e8621a] transition-colors">
                <AvatarImage src={creator.avatar_url ?? undefined} />
                <AvatarFallback className="font-['DM_Sans'] text-xs bg-[#fdf2ec] text-[#e8621a] font-bold">
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
              <span
                key={role.id}
                className="font-['DM_Sans'] text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#f2f0ed] text-[#6b6762] border border-[#e0ddd8]"
              >
                {role.quantity > 1 ? `${role.quantity}× ` : ""}{role.role_name}
              </span>
            ))}
            {roles.length > 4 && (
              <span className="font-['DM_Sans'] text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#f2f0ed] text-[#6b6762]">
                +{roles.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Bottom */}
        <div className="mt-3 flex items-center justify-between font-['DM_Sans'] text-[11px] text-[#6b6762] border-t border-[#f2f0ed] pt-3">
          <span>{creator?.full_name}</span>
          <span>{COLLAB_LABELS[project.collab_type]}</span>
        </div>
      </div>
    </Link>
  )
}
