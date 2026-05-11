'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Feature Film', value: 'film' },
  { label: 'Short Film', value: 'short' },
  { label: 'Documentary', value: 'documentary' },
  { label: 'Series / TV', value: 'series' },
  { label: 'Music Video', value: 'music_video' },
  { label: 'Animation', value: 'animation' },
  { label: 'Experimental', value: 'experimental' },
]

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
  currentCategory?: string
}

const sectionLabel =
  'font-unbounded text-[9px] font-bold tracking-[.15em] uppercase text-[#6b6762] mb-2'

export function ExploreFilters({
  currentStage,
  currentCommitment,
  currentCategory,
}: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleSearch = useCallback(
    (value: string) => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
      searchDebounce.current = setTimeout(() => updateFilter('search', value.trim()), 300)
    },
    [updateFilter]
  )

  const handleRole = useCallback(
    (value: string) => {
      if (roleDebounce.current) clearTimeout(roleDebounce.current)
      roleDebounce.current = setTimeout(() => updateFilter('role', value.trim()), 300)
    },
    [updateFilter]
  )

  const inputClass =
    'font-sans text-[13px] text-[#1a1918] placeholder:text-[#6b6762] bg-white border border-[#e0ddd8] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e8621a] transition-colors w-full'

  return (
    <div className="space-y-4">
      {/* Compact top row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          key={searchParams.get('search') ?? ''}
          type="text"
          placeholder="Search projects…"
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className={inputClass + ' flex-[2]'}
        />
        <select
          value={currentCategory ?? ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          className={inputClass + ' flex-1'}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          key={searchParams.get('role') ?? ''}
          type="text"
          placeholder="Role needed…"
          defaultValue={searchParams.get('role') ?? ''}
          onChange={(e) => handleRole(e.target.value)}
          className={inputClass + ' flex-1'}
        />
      </div>

      {/* Stage */}
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

      {/* Commitment */}
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
