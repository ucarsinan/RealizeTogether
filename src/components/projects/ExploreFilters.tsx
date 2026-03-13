"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type { ProjectStage, CommitmentType } from "@/lib/types"
import { cn } from "@/lib/utils"

const STAGES: { value: ProjectStage | "all"; label: string }[] = [
  { value: "all",         label: "All Stages" },
  { value: "idea",        label: "Idea" },
  { value: "concept",     label: "Concept" },
  { value: "development", label: "Development" },
  { value: "ready",       label: "Ready" },
  { value: "production",  label: "Production" },
]

const COMMITMENTS: { value: CommitmentType | "all"; label: string }[] = [
  { value: "all",          label: "Any" },
  { value: "hobby",        label: "Hobby" },
  { value: "side_project", label: "Side Project" },
  { value: "serious",      label: "Serious" },
  { value: "professional", label: "Professional" },
]

interface ExploreFiltersProps {
  currentStage?: string
  currentCommitment?: string
}

export function ExploreFilters({ currentStage, currentCommitment }: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/explore?${params.toString()}`)
  }, [router, searchParams])

  const pillActive = "bg-[#e8621a] text-white font-bold rounded-full px-4 py-2 text-[12px] font-['DM_Sans'] border border-[#e8621a] transition-colors"
  const pillInactive = "bg-white text-[#6b6762] border border-[#e0ddd8] rounded-full px-4 py-2 text-[12px] font-['DM_Sans'] hover:border-[#1a1918] hover:text-[#1a1918] transition-colors"
  const sectionLabel = "font-['Unbounded'] text-[9px] font-bold tracking-[.15em] uppercase text-[#6b6762] mb-3"

  return (
    <div className="space-y-4">
      <div>
        <p className={sectionLabel}>STAGE</p>
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {STAGES.map(s => (
            <button
              key={s.value}
              onClick={() => updateFilter("stage", s.value)}
              className={(s.value === "all" ? !currentStage : currentStage === s.value) ? pillActive : pillInactive}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={sectionLabel}>COMMITMENT</p>
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {COMMITMENTS.map(c => (
            <button
              key={c.value}
              onClick={() => updateFilter("commitment", c.value)}
              className={(c.value === "all" ? !currentCommitment : currentCommitment === c.value) ? pillActive : pillInactive}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
