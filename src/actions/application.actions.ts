'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'
import { sendEmail } from '@/lib/email/resend'
import { newApplicationEmail, applicationAcceptedEmail } from '@/lib/email/templates'

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
    .select('creator_id, status, title')
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

  // Email: notify creator about new application (fire-and-forget)
  void (async () => {
    try {
      const admin = createAdminClient()
      const [{ data: creatorAuth }, { data: applicantProfile }] = await Promise.all([
        admin.auth.admin.getUserById(project.creator_id),
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      ])
      const creatorEmail = creatorAuth?.user?.email
      if (creatorEmail) {
        const { subject, html } = newApplicationEmail({
          projectTitle: project.title,
          applicantName: applicantProfile?.full_name ?? 'Someone',
          projectId: input.project_id,
        })
        await sendEmail({ to: creatorEmail, subject, html })
      }
    } catch (e) {
      console.error('[email] newApplication error:', e)
    }
  })()

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
    .select('*, projects(creator_id, title)')
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

  // Email: notify applicant they were accepted (fire-and-forget)
  void (async () => {
    try {
      const admin = createAdminClient()
      const proj = application.projects as unknown as { creator_id: string; title: string }
      const [{ data: applicantAuth }, { data: creatorProfile }] = await Promise.all([
        admin.auth.admin.getUserById(application.applicant_id),
        supabase.from('profiles').select('full_name').eq('id', proj.creator_id).single(),
      ])
      const applicantEmail = applicantAuth?.user?.email
      if (applicantEmail) {
        const { subject, html } = applicationAcceptedEmail({
          projectTitle: proj.title,
          creatorName: creatorProfile?.full_name ?? 'The creator',
          conversationId: conversation.id,
        })
        await sendEmail({ to: applicantEmail, subject, html })
      }
    } catch (e) {
      console.error('[email] applicationAccepted error:', e)
    }
  })()

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

// ─────────────────────────────────────────────
// EINGEGANGENE BEWERBUNGEN ZÄHLEN
// ─────────────────────────────────────────────

export async function getReceivedApplicationsCount(): Promise<ActionResult<number>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('creator_id', user.id)

  if (projectsError) return { success: false, error: projectsError.message }

  const projectIds = (projects ?? []).map((p) => p.id)
  if (projectIds.length === 0) return { success: true, data: 0 }

  const { count, error } = await supabase
    .from('project_applications')
    .select('id', { count: 'exact', head: true })
    .in('project_id', projectIds)

  if (error) return { success: false, error: error.message }
  return { success: true, data: count ?? 0 }
}
