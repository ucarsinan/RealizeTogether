'use server'

import type { ActionResult } from '@/lib/types'

export type ProjectAnalytics = {
  project_id: string
  title: string
  status: string
  nda_consents: number
  applications: {
    total: number
    pending: number
    in_talks: number
    matched: number
    rejected: number
    verified: number
  }
  match_rate: number | null
}

export type CreatorAnalytics = {
  global: {
    total_applications: number
    total_matches: number
    total_nda_consents: number
    match_rate: number | null
  }
  projects: ProjectAnalytics[]
}

export async function getCreatorAnalytics(): Promise<ActionResult<CreatorAnalytics>> {
  throw new Error('not implemented')
}
