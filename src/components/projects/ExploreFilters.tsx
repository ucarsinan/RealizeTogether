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

  const pillBase = "font-['DM_Sans'] text-[12px] font-medium px-4 py-1.5 rounded-full border transition-colors duration-150"
  const pillActive = "bg-[#e8621a] border-[#e8621a] text-white"
  const pillInactive = "bg-white border-[#e0ddd8] text-[#6b6762] hover:border-[#1a1918] hover:text-[#1a1918]"

  return (
    <div className="space-y-4">
      <div>
        <p className="font-['DM_Sans'] text-[11px] font-medium text-[#6b6762] uppercase tracking-widest mb-2.5">
          Stage
        </p>
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {STAGES.map(s => (
            <button
              key={s.value}
              onClick={() => updateFilter("stage", s.value)}
              className={cn(pillBase, (s.value === "all" ? !currentStage : currentStage === s.value) ? pillActive : pillInactive)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-['DM_Sans'] text-[11px] font-medium text-[#6b6762] uppercase tracking-widest mb-2.5">
          Commitment
        </p>
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {COMMITMENTS.map(c => (
            <button
              key={c.value}
              onClick={() => updateFilter("commitment", c.value)}
              className={cn(pillBase, (c.value === "all" ? !currentCommitment : currentCommitment === c.value) ? pillActive : pillInactive)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
