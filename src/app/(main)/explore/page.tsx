import { Suspense } from 'react'
import Link from 'next/link'
import { getProjects } from '@/actions/project.actions'
import { getProjectMatches, type ProjectMatch } from '@/actions/matching.actions'
import { ExploreFilters } from '@/components/projects/ExploreFilters'
import { ExploreResults } from '@/components/projects/ExploreResults'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import type { ProjectStage, CommitmentType, ProjectWithRoles } from '@/lib/types'
import { STAGE_LABELS, COMMITMENT_LABELS } from '@/lib/utils'

type SearchParams = Promise<{
  stage?: ProjectStage
  commitment?: CommitmentType
  category?: string
  search?: string
  role?: string
}>

export const metadata = {
  title: 'Explore Projects – Realize Together',
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [result, matchesResult] = await Promise.all([
    getProjects({
      stage: params.stage,
      commitment_type: params.commitment,
      category: params.category,
    }),
    user ? getProjectMatches(user.id) : Promise.resolve({ success: true as const, data: [] }),
  ])

  const projects = result.success ? result.data : []
  const matches = matchesResult.success ? matchesResult.data : []

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
        <div className="mb-8">
          <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            DISCOVER
          </p>
          <Breadcrumb items={[{ label: 'Explore' }]} />
          <h1 className="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Find your next project.
          </h1>
        </div>

        <Suspense>
          <ExploreFilters
            currentStage={params.stage}
            currentCommitment={params.commitment}
            currentCategory={params.category}
          />
        </Suspense>

        {matches.length > 0 && (
          <div className="mt-8">
            <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-4">
              Empfohlen für dich
            </p>
            <RecommendedProjectStrip matches={matches} allProjects={projects} />
          </div>
        )}

        <div className="mt-8">
          <Suspense>
            <ExploreResults projects={projects} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function RecommendedProjectStrip({
  matches,
  allProjects,
}: {
  matches: ProjectMatch[]
  allProjects: ProjectWithRoles[]
}) {
  const projectMap = Object.fromEntries(allProjects.map((p) => [p.id, p]))

  return (
    <div className="flex flex-wrap gap-4">
      {matches.map((match) => {
        const project = projectMap[match.project_id]
        if (!project) return null
        return (
          <Link
            key={`${match.project_id}-${match.role_id}`}
            href={`/projects/${project.id}`}
            className="bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4 flex flex-col gap-2 shadow-[0_4px_32px_rgba(0,0,0,0.07)] hover:border-[#e8621a] transition-colors min-w-[220px] max-w-[280px]"
          >
            <span className="font-unbounded font-black text-[15px] leading-tight text-[#1a1918] line-clamp-2">
              {project.title}
            </span>
            <span className="font-sans text-[11px] text-[#e8621a] font-medium">
              {match.role_name}
            </span>
            <div className="flex gap-2 flex-wrap">
              <span className="font-sans text-[10px] text-[#6b6762] bg-[#f2f0ed] px-2 py-0.5 rounded-full">
                {STAGE_LABELS[project.stage ?? 'idea']}
              </span>
              <span className="font-sans text-[10px] text-[#6b6762] bg-[#f2f0ed] px-2 py-0.5 rounded-full">
                {COMMITMENT_LABELS[project.commitment_type ?? 'hobby']}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
