'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult, Project, ProjectWithRoles } from '@/lib/types'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ProjectRoleInput = {
  role_name: string
  quantity: number
  description: string
}

export type CreateProjectInput = {
  title: string
  description: string
  logline: string
  category: string
  stage: Project['stage']
  commitment_type: Project['commitment_type']
  collab_type: Project['collab_type']
  requires_nda: boolean
  roles: ProjectRoleInput[]
}

// ─────────────────────────────────────────────
// PROJEKT ERSTELLEN
// ─────────────────────────────────────────────

export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      creator_id: user.id,
      title: input.title.trim(),
      description: input.description.trim(),
      logline: input.logline.trim() || null,
      category: input.category,
      stage: input.stage,
      commitment_type: input.commitment_type,
      collab_type: input.collab_type,
      requires_nda: input.requires_nda,
      status: 'open',
    })
    .select('id')
    .single()

  if (projectError) return { success: false, error: projectError.message }

  if (input.roles.length > 0) {
    const rolesData = input.roles
      .filter((r) => r.role_name.trim() !== '')
      .map((r) => ({
        project_id: project.id,
        role_name: r.role_name.trim(),
        quantity: r.quantity,
        description: r.description.trim() || null,
      }))

    if (rolesData.length > 0) {
      const { error: rolesError } = await supabase.from('project_roles').insert(rolesData)

      if (rolesError) {
        await supabase.from('projects').delete().eq('id', project.id)
        return { success: false, error: rolesError.message }
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/explore')

  return { success: true, data: { id: project.id } }
}

// ─────────────────────────────────────────────
// SYNOPSIS UPLOAD (NDA-geschützt)
// ─────────────────────────────────────────────

export async function uploadSynopsis(
  projectId: string,
  formData: FormData
): Promise<ActionResult<{ synopsis_url: string }>> {
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

  const file = formData.get('synopsis')
  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  if (file.type !== 'application/pdf') {
    return { success: false, error: 'Only PDF files allowed' }
  }

  if (file.size > 20 * 1024 * 1024) {
    return { success: false, error: 'File too large (max 20MB)' }
  }

  const timestamp = Date.now()
  const filePath = `${projectId}/synopsis-${timestamp}.pdf`

  // Alte Dateien löschen
  const { data: existingFiles } = await supabase.storage.from('synopses').list(projectId)

  if (existingFiles && existingFiles.length > 0) {
    const toDelete = existingFiles.map((f) => `${projectId}/${f.name}`)
    await supabase.storage.from('synopses').remove(toDelete)
  }

  const { error: uploadError } = await supabase.storage.from('synopses').upload(filePath, file)

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: signedData, error: urlError } = await supabase.storage
    .from('synopses')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7)

  if (urlError || !signedData?.signedUrl) return { success: false, error: 'Could not generate URL' }

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      synopsis_url: filePath,
      requires_nda: true,
    })
    .eq('id', projectId)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath(`/projects/${projectId}`)

  return { success: true, data: { synopsis_url: signedData.signedUrl } }
}

// ─────────────────────────────────────────────
// PROJEKTE LADEN
// ─────────────────────────────────────────────

export async function getProjects(filters?: {
  stage?: Project['stage']
  commitment_type?: Project['commitment_type']
  category?: string
}): Promise<ActionResult<ProjectWithRoles[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select(
      `
      *,
      project_roles (id, role_name, quantity, description),
      profiles (id, full_name, avatar_url, is_verified, video_url)
    `
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.stage) query = query.eq('stage', filters.stage)
  if (filters?.commitment_type) query = query.eq('commitment_type', filters.commitment_type)
  if (filters?.category) query = query.eq('category', filters.category)

  const { data, error } = await query

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProjectWithRoles[] }
}

export async function getProject(id: string): Promise<ActionResult<ProjectWithRoles>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_roles (id, role_name, quantity, description),
      profiles (id, full_name, avatar_url, is_verified, video_url)
    `
    )
    .eq('id', id)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProjectWithRoles }
}

export async function getMyProjects(): Promise<ActionResult<ProjectWithRoles[]>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_roles (id, role_name, quantity, description),
      profiles (id, full_name, avatar_url, is_verified, video_url)
    `
    )
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as ProjectWithRoles[] }
}
