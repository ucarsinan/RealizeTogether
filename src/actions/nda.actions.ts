'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

// ─────────────────────────────────────────────
// NDA-ZUSTIMMUNG PRÜFEN
// ─────────────────────────────────────────────

export async function checkNdaConsent(
  projectId: string
): Promise<ActionResult<{ hasConsented: boolean }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: true, data: { hasConsented: false } }

  const { data, error } = await supabase
    .from('nda_consents')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  return { success: true, data: { hasConsented: !!data } }
}

// ─────────────────────────────────────────────
// NDA-ZUSTIMMUNG EINTRAGEN
// ─────────────────────────────────────────────

export async function submitNdaConsent(projectId: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('nda_consents')
    .upsert(
      { project_id: projectId, user_id: user.id },
      { onConflict: 'project_id,user_id', ignoreDuplicates: true }
    )

  if (error) return { success: false, error: error.message }

  return { success: true, data: undefined }
}

// ─────────────────────────────────────────────
// SIGNED URL FÜR SYNOPSIS (nur nach NDA)
// ─────────────────────────────────────────────

export async function getSynopsisUrl(projectId: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: consent } = await supabase
    .from('nda_consents')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: project } = await supabase
    .from('projects')
    .select('synopsis_url, creator_id')
    .eq('id', projectId)
    .single()

  if (!project?.synopsis_url) {
    return { success: false, error: 'No synopsis uploaded' }
  }

  // Owner hat immer Zugriff; andere brauchen NDA
  if (project.creator_id !== user.id && !consent) {
    return { success: false, error: 'NDA consent required' }
  }

  const { data, error } = await supabase.storage
    .from('synopses')
    .createSignedUrl(project.synopsis_url, 60 * 60)

  if (error || !data?.signedUrl) {
    return { success: false, error: 'Could not generate URL' }
  }

  return { success: true, data: { url: data.signedUrl } }
}
