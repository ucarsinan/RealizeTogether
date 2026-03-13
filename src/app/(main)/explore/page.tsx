import { Suspense } from "react"
import { getProjects } from "@/actions/project.actions"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ExploreFilters } from "@/components/projects/ExploreFilters"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import type { ProjectStage, CommitmentType } from "@/lib/types"

type SearchParams = Promise<{
  stage?: ProjectStage
  commitment?: CommitmentType
  category?: string
}>

export const metadata = {
  title: "Explore Projects – Realize Together",
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const result = await getProjects({
    stage: params.stage,
    commitment_type: params.commitment,
    category: params.category,
  })

  const projects = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            DISCOVER
          </p>
          <Breadcrumb items={[{ label: 'Explore' }]} />
          <h1 className="font-['Unbounded'] font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Find your next project.
          </h1>
        </div>

        {/* Filters */}
        <Suspense>
          <ExploreFilters currentStage={params.stage} currentCommitment={params.commitment} />
        </Suspense>

        {/* Project grid */}
        <div className="mt-8">
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#e0ddd8] rounded-2xl">
              <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">
                No projects found matching your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
