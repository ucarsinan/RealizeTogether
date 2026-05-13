'use server'

import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('creator_id', user.id)

  if (projectsError) return { success: false, error: projectsError.message }
  if (!projects || projects.length === 0) {
    return {
      success: true,
      data: {
        global: {
          total_applications: 0,
          total_matches: 0,
          total_nda_consents: 0,
          match_rate: null,
        },
        projects: [],
      },
    }
  }

  const projectIds = projects.map((p) => p.id)

  const [appsResult, ndasResult] = await Promise.all([
    supabase
      .from('project_applications')
      .select('project_id, status, profiles(is_verified)')
      .in('project_id', projectIds),
    supabase.from('nda_consents').select('project_id').in('project_id', projectIds),
  ])

  const apps = appsResult.data ?? []
  const ndas = ndasResult.data ?? []

  // Count NDAs per project
  const ndaByProject: Record<string, number> = {}
  for (const nda of ndas) {
    ndaByProject[nda.project_id] = (ndaByProject[nda.project_id] ?? 0) + 1
  }

  // Aggregate applications per project
  const appsByProject: Record<
    string,
    {
      total: number
      pending: number
      in_talks: number
      matched: number
      rejected: number
      verified: number
    }
  > = {}

  for (const app of apps) {
    if (!appsByProject[app.project_id]) {
      appsByProject[app.project_id] = {
        total: 0,
        pending: 0,
        in_talks: 0,
        matched: 0,
        rejected: 0,
        verified: 0,
      }
    }
    const bucket = appsByProject[app.project_id]
    bucket.total++
    const status = app.status as string
    if (status === 'pending') bucket.pending++
    else if (status === 'in_talks') bucket.in_talks++
    else if (status === 'matched') bucket.matched++
    else if (status === 'rejected') bucket.rejected++
    const profile = app.profiles as unknown as { is_verified: boolean } | null
    if (profile?.is_verified) bucket.verified++
  }

  const empty = { total: 0, pending: 0, in_talks: 0, matched: 0, rejected: 0, verified: 0 }

  const projectAnalytics: ProjectAnalytics[] = projects.map((p) => {
    const a = appsByProject[p.id] ?? { ...empty }
    return {
      project_id: p.id,
      title: p.title,
      status: p.status,
      nda_consents: ndaByProject[p.id] ?? 0,
      applications: a,
      match_rate: a.total > 0 ? Math.round((a.matched / a.total) * 10000) / 100 : null,
    }
  })

  const totalApplications = projectAnalytics.reduce((s, p) => s + p.applications.total, 0)
  const totalMatches = projectAnalytics.reduce((s, p) => s + p.applications.matched, 0)
  const totalNda = projectAnalytics.reduce((s, p) => s + p.nda_consents, 0)

  return {
    success: true,
    data: {
      global: {
        total_applications: totalApplications,
        total_matches: totalMatches,
        total_nda_consents: totalNda,
        match_rate:
          totalApplications > 0
            ? Math.round((totalMatches / totalApplications) * 10000) / 100
            : null,
      },
      projects: projectAnalytics,
    },
  }
}
