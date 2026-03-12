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

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2">Stage</p>
        <div className="flex flex-wrap gap-2">
          {STAGES.map(s => (
            <button
              key={s.value}
              onClick={() => updateFilter("stage", s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                (s.value === "all" ? !currentStage : currentStage === s.value)
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2">Commitment</p>
        <div className="flex flex-wrap gap-2">
          {COMMITMENTS.map(c => (
            <button
              key={c.value}
              onClick={() => updateFilter("commitment", c.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                (c.value === "all" ? !currentCommitment : currentCommitment === c.value)
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
