import { Suspense } from 'react'
import { getProjects } from '@/actions/project.actions'
import { ExploreFilters } from '@/components/projects/ExploreFilters'
import { ExploreResults } from '@/components/projects/ExploreResults'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import type { ProjectStage, CommitmentType } from '@/lib/types'

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

  const result = await getProjects({
    stage: params.stage,
    commitment_type: params.commitment,
    category: params.category,
  })

  const projects = result.success ? result.data : []

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

        <div className="mt-8">
          <Suspense>
            <ExploreResults projects={projects} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
