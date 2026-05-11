'use client'

import { useSearchParams } from 'next/navigation'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { ProjectWithRoles } from '@/lib/types'

export function filterProjects(
  projects: ProjectWithRoles[],
  search: string,
  role: string
): ProjectWithRoles[] {
  const q = search.toLowerCase()
  const r = role.toLowerCase()

  return projects
    .filter((p) => {
      if (!q) return true
      return p.title.toLowerCase().includes(q) || (p.logline ?? '').toLowerCase().includes(q)
    })
    .filter((p) => {
      if (!r) return true
      return p.project_roles.some((pr) => pr.role_name.toLowerCase().includes(r))
    })
}

interface ExploreResultsProps {
  projects: ProjectWithRoles[]
}

export function ExploreResults({ projects }: ExploreResultsProps) {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') ?? ''

  const filtered = filterProjects(projects, search, role)

  if (filtered.length === 0) {
    return (
      <section
        aria-label="No projects found"
        className="text-center py-20 bg-white border border-[#e0ddd8] rounded-2xl"
      >
        <p className="font-sans text-[13px] text-[#6b6762]">
          No projects match your filters. Try adjusting them.
        </p>
      </section>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
