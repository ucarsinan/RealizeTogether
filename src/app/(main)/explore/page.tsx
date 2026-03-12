import { Suspense } from "react"
import { getProjects } from "@/actions/project.actions"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ExploreFilters } from "@/components/projects/ExploreFilters"
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
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Explore Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">Find a project that needs your skills</p>
        </div>

        <Suspense>
          <ExploreFilters currentStage={params.stage} currentCommitment={params.commitment} />
        </Suspense>

        <div className="mt-6 space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <p className="text-sm">No projects found matching your filters.</p>
            </div>
          ) : (
            projects.map(project => <ProjectCard key={project.id} project={project} />)
          )}
        </div>
      </div>
    </div>
  )
}
