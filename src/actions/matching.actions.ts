'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

const AI_BACKEND_URL = process.env.AI_BACKEND_URL

export type ProjectMatch = {
  project_id: string
  role_id: string
  role_name: string
  score: number
}

export type TalentMatch = {
  user_id: string
  score: number
  matched_role: string
  profile: { id: string; full_name: string; avatar_url: string | null } | null
}

export async function getProjectMatches(userId: string): Promise<ActionResult<ProjectMatch[]>> {
  try {
    const res = await fetch(`${AI_BACKEND_URL}/ai/match-projects?user_id=${userId}`)
    if (!res.ok) return { success: true, data: [] }
    const data = (await res.json()) as { matches: ProjectMatch[] }
    return { success: true, data: data.matches ?? [] }
  } catch {
    return { success: true, data: [] }
  }
}

export async function getTalentMatches(projectId: string): Promise<ActionResult<TalentMatch[]>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: true, data: [] }

  const { data: project } = await supabase
    .from('projects')
    .select('creator_id')
    .eq('id', projectId)
    .single()

  if (!project || project.creator_id !== user.id) return { success: true, data: [] }

  try {
    const res = await fetch(`${AI_BACKEND_URL}/ai/match-talents?project_id=${projectId}`)
    if (!res.ok) return { success: true, data: [] }
    const data = (await res.json()) as {
      matches: Array<{ user_id: string; score: number; matched_role: string }>
    }
    const matches = data.matches ?? []
    if (matches.length === 0) return { success: true, data: [] }

    const userIds = matches.map((m) => m.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

    return {
      success: true,
      data: matches.map((m) => ({
        ...m,
        profile: profileMap[m.user_id] ?? null,
      })),
    }
  } catch {
    return { success: true, data: [] }
  }
}
