'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ApplicationWithDetails = {
  id: string
  project_id: string
  role_id: string | null
  applicant_id: string
  status: 'pending' | 'in_talks' | 'matched' | 'rejected'
  message: string | null
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
    video_url: string | null
    is_verified: boolean
    portfolio_url: string | null
    imdb_url: string | null
    vimeo_url: string | null
    linkedin_url: string | null
  }
  projects: {
    id: string
    title: string
  } | null
  project_roles: {
    id: string
    role_name: string
  } | null
}

// ─────────────────────────────────────────────
// BEWERBUNG EINREICHEN
// ─────────────────────────────────────────────

export async function submitApplication(input: {
  project_id: string
  role_id: string | null
  message: string
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: project } = await supabase
    .from('projects')
    .select('creator_id, status')
    .eq('id', input.project_id)
    .single()

  if (!project) return { success: false, error: 'Project not found' }
  if (project.creator_id === user.id)
    return { success: false, error: 'You cannot apply to your own project' }
  if (project.status !== 'open')
    return { success: false, error: 'Project is no longer accepting applications' }

  const { data, error } = await supabase
    .from('project_applications')
    .insert({
      project_id: input.project_id,
      role_id: input.role_id,
      applicant_id: user.id,
      message: input.message.trim(),
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already applied to this project' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath(`/projects/${input.project_id}`)

  return { success: true, data: { id: data.id } }
}

// ─────────────────────────────────────────────
// BEWERBUNGEN LADEN (für Creator)
// ─────────────────────────────────────────────

export async function getApplicationsForProject(
  projectId: string
): Promise<ActionResult<ApplicationWithDetails[]>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: project } = await supabase
    .from('projects')
    .select('creator_id')
    .eq('id', projectId)
    .single()

  if (!project || project.creator_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const { data, error } = await supabase
    .from('project_applications')
    .select(
      `
      *,
      profiles (
        id, full_name, avatar_url, video_url, is_verified,
        portfolio_url, imdb_url, vimeo_url, linkedin_url
      ),
      project_roles (id, role_name)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  return { success: true, data: data as ApplicationWithDetails[] }
}

// ─────────────────────────────────────────────
// BEWERBUNG ANNEHMEN → in_talks + Conversation
// ─────────────────────────────────────────────

export async function acceptApplication(
  applicationId: string
): Promise<ActionResult<{ conversationId: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: application } = await supabase
    .from('project_applications')
    .select('*, projects(creator_id)')
    .eq('id', applicationId)
    .single()

  if (!application) return { success: false, error: 'Application not found' }

  const project = application.projects as unknown as { creator_id: string }
  if (project.creator_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (application.status !== 'pending') {
    return { success: false, error: 'Application is no longer pending' }
  }

  const { error: updateError } = await supabase
    .from('project_applications')
    .update({ status: 'in_talks' })
    .eq('id', applicationId)

  if (updateError) return { success: false, error: updateError.message }

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      application_id: applicationId,
      project_id: application.project_id,
    })
    .select('id')
    .single()

  if (convError) {
    await supabase
      .from('project_applications')
      .update({ status: 'pending' })
      .eq('id', applicationId)
    return { success: false, error: convError.message }
  }

  revalidatePath(`/projects/${application.project_id}/applications`)
  revalidatePath('/messages')

  return { success: true, data: { conversationId: conversation.id } }
}

// ─────────────────────────────────────────────
// BEWERBUNG ABLEHNEN
// ─────────────────────────────────────────────

export async function rejectApplication(applicationId: string): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: application } = await supabase
    .from('project_applications')
    .select('project_id, projects(creator_id)')
    .eq('id', applicationId)
    .single()

  if (!application) return { success: false, error: 'Application not found' }

  const project = application.projects as unknown as { creator_id: string }
  if (project.creator_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('project_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/projects/${application.project_id}/applications`)

  return { success: true, data: undefined }
}

// ─────────────────────────────────────────────
// DOUBLE OPT-IN MATCH BESTÄTIGEN
// ─────────────────────────────────────────────

export async function confirmMatch(
  applicationId: string
): Promise<ActionResult<{ isComplete: boolean }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: application } = await supabase
    .from('project_applications')
    .select('*, projects(creator_id)')
    .eq('id', applicationId)
    .single()

  if (!application) return { success: false, error: 'Application not found' }
  if (application.status !== 'in_talks') {
    return { success: false, error: 'Must be in talks to confirm match' }
  }

  const project = application.projects as unknown as { creator_id: string }
  const isCreator = project.creator_id === user.id
  const isApplicant = application.applicant_id === user.id

  if (!isCreator && !isApplicant) {
    return { success: false, error: 'Not authorized' }
  }

  const { data: existingMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('project_id', application.project_id)
    .eq('user_id', application.applicant_id)
    .maybeSingle()

  let creatorConfirmed = existingMatch?.creator_confirmed ?? false
  let applicantConfirmed = existingMatch?.applicant_confirmed ?? false

  if (isCreator) creatorConfirmed = true
  if (isApplicant) applicantConfirmed = true

  const isComplete = creatorConfirmed && applicantConfirmed

  if (existingMatch) {
    const { error } = await supabase
      .from('matches')
      .update({
        creator_confirmed: creatorConfirmed,
        applicant_confirmed: applicantConfirmed,
        ...(isComplete ? { matched_at: new Date().toISOString() } : {}),
      })
      .eq('id', existingMatch.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('matches').insert({
      project_id: application.project_id,
      user_id: application.applicant_id,
      role_id: application.role_id,
      creator_confirmed: creatorConfirmed,
      applicant_confirmed: applicantConfirmed,
      ...(isComplete ? { matched_at: new Date().toISOString() } : {}),
    })

    if (error) return { success: false, error: error.message }
  }

  if (isComplete) {
    await supabase
      .from('project_applications')
      .update({ status: 'matched' })
      .eq('id', applicationId)

    await supabase
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('id', application.project_id)
  }

  revalidatePath('/messages')
  revalidatePath('/dashboard')

  return { success: true, data: { isComplete } }
}

// ─────────────────────────────────────────────
// EIGENE BEWERBUNGEN LADEN (für Applicant)
// ─────────────────────────────────────────────

export async function getMyApplications(): Promise<ActionResult<ApplicationWithDetails[]>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('project_applications')
    .select(
      `
      *,
      projects (id, title),
      profiles (id, full_name, avatar_url, video_url, is_verified,
                portfolio_url, imdb_url, vimeo_url, linkedin_url),
      project_roles (id, role_name)
    `
    )
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  return { success: true, data: data as ApplicationWithDetails[] }
}
