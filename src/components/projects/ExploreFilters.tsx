'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

const stageOptions = [
  { label: 'All Stages', value: '' },
  { label: 'Idea', value: 'idea' },
  { label: 'Concept', value: 'concept' },
  { label: 'Development', value: 'development' },
  { label: 'Ready', value: 'ready' },
  { label: 'Production', value: 'production' },
]

const commitmentOptions = [
  { label: 'Any', value: '' },
  { label: 'Hobby', value: 'hobby' },
  { label: 'Side Project', value: 'side_project' },
  { label: 'Serious', value: 'serious' },
  { label: 'Professional', value: 'professional' },
]

interface ExploreFiltersProps {
  currentStage?: string
  currentCommitment?: string
}

const sectionLabel =
  'font-unbounded text-[9px] font-bold tracking-[.15em] uppercase text-[#6b6762] mb-2'

export function ExploreFilters({ currentStage, currentCommitment }: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/explore?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-4">
      <div>
        <p className={sectionLabel}>STAGE</p>
        <div className="overflow-x-auto">
          <SegmentedControl
            options={stageOptions}
            value={currentStage ?? ''}
            onChange={(val) => updateFilter('stage', val)}
          />
        </div>
      </div>

      <div>
        <p className={sectionLabel}>COMMITMENT</p>
        <div className="overflow-x-auto">
          <SegmentedControl
            options={commitmentOptions}
            value={currentCommitment ?? ''}
            onChange={(val) => updateFilter('commitment', val)}
          />
        </div>
      </div>
    </div>
  )
}
