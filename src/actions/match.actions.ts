"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export type MatchStatus = {
  creatorConfirmed: boolean
  applicantConfirmed: boolean
  matchedAt: string | null
}

// ─────────────────────────────────────────────
// MATCH BESTÄTIGEN (Double Opt-in)
// ─────────────────────────────────────────────

export async function confirmMatch(
  applicationId: string
): Promise<ActionResult<{ isComplete: boolean }>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  // Load application + project
  const { data: application } = await supabase
    .from("project_applications")
    .select("id, project_id, applicant_id, role_id, status, projects(creator_id)")
    .eq("id", applicationId)
    .single()

  if (!application) return { success: false, error: "Application not found" }
  if (application.status !== "in_talks") {
    return { success: false, error: "Application is not in talks" }
  }

  const project = application.projects as unknown as { creator_id: string }
  const isCreator = user.id === project.creator_id
  const isApplicant = user.id === application.applicant_id

  if (!isCreator && !isApplicant) {
    return { success: false, error: "Not authorized" }
  }

  // Check if a match row already exists
  const { data: existing } = await supabase
    .from("matches")
    .select("id, creator_confirmed, applicant_confirmed")
    .eq("project_id", application.project_id)
    .eq("user_id", application.applicant_id)
    .maybeSingle()

  let creatorConfirmed = existing?.creator_confirmed ?? false
  let applicantConfirmed = existing?.applicant_confirmed ?? false

  if (isCreator) creatorConfirmed = true
  if (isApplicant) applicantConfirmed = true

  if (existing) {
    const { error } = await supabase
      .from("matches")
      .update({
        ...(isCreator ? { creator_confirmed: true } : {}),
        ...(isApplicant ? { applicant_confirmed: true } : {}),
      })
      .eq("id", existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("matches")
      .insert({
        project_id: application.project_id,
        user_id: application.applicant_id,
        role_id: application.role_id,
        creator_confirmed: isCreator,
        applicant_confirmed: isApplicant,
      })

    if (error) return { success: false, error: error.message }
  }

  const isComplete = creatorConfirmed && applicantConfirmed

  // Both confirmed → finalize
  if (isComplete) {
    const now = new Date().toISOString()

    await supabase
      .from("matches")
      .update({ matched_at: now })
      .eq("project_id", application.project_id)
      .eq("user_id", application.applicant_id)

    await supabase
      .from("project_applications")
      .update({ status: "matched" })
      .eq("id", applicationId)

    await supabase
      .from("projects")
      .update({ status: "in_progress" })
      .eq("id", application.project_id)

    revalidatePath(`/projects/${application.project_id}`)
    revalidatePath("/dashboard")
  }

  revalidatePath("/messages")
  return { success: true, data: { isComplete } }
}

// ─────────────────────────────────────────────
// MATCH STATUS LADEN
// ─────────────────────────────────────────────

export async function getMatchStatus(
  applicationId: string
): Promise<ActionResult<MatchStatus>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  const { data: application } = await supabase
    .from("project_applications")
    .select("project_id, applicant_id")
    .eq("id", applicationId)
    .single()

  if (!application) return { success: false, error: "Application not found" }

  const { data: match } = await supabase
    .from("matches")
    .select("creator_confirmed, applicant_confirmed, matched_at")
    .eq("project_id", application.project_id)
    .eq("user_id", application.applicant_id)
    .maybeSingle()

  return {
    success: true,
    data: {
      creatorConfirmed: match?.creator_confirmed ?? false,
      applicantConfirmed: match?.applicant_confirmed ?? false,
      matchedAt: match?.matched_at ?? null,
    },
  }
}
