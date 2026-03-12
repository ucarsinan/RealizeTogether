"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResult, Profile } from "@/lib/types"

// ─────────────────────────────────────────────
// PROFIL LESEN
// ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ActionResult<Profile>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getCurrentProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  return getProfile(user.id)
}

// ─────────────────────────────────────────────
// PROFIL AKTUALISIEREN
// ─────────────────────────────────────────────

export type UpdateProfileInput = {
  full_name: string
  bio?: string
  portfolio_url?: string
  imdb_url?: string
  vimeo_url?: string
  linkedin_url?: string
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult<Profile>> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  // Leere Strings → null
  const sanitized = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, v === "" ? null : v])
  )

  const { data, error } = await supabase
    .from("profiles")
    .update(sanitized)
    .eq("id", user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard")
  revalidatePath(`/profile/${user.id}`)

  return { success: true, data }
}

// ─────────────────────────────────────────────
// AVATAR UPLOAD
// ─────────────────────────────────────────────

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ avatar_url: string }>> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  const file = formData.get("avatar") as File
  if (!file || file.size === 0) return { success: false, error: "No file provided" }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files allowed" }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File too large (max 5MB)" }
  }

  const fileExt = file.name.split(".").pop()
  const filePath = `${user.id}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath("/dashboard")
  return { success: true, data: { avatar_url: publicUrl } }
}

// ─────────────────────────────────────────────
// VIDEO UPLOAD
// ─────────────────────────────────────────────

export async function uploadVideo(
  formData: FormData
): Promise<ActionResult<{ video_url: string }>> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  const file = formData.get("video") as File
  if (!file || file.size === 0) return { success: false, error: "No file provided" }

  if (!file.type.startsWith("video/")) {
    return { success: false, error: "Only video files allowed" }
  }

  if (file.size > 50 * 1024 * 1024) {
    return { success: false, error: "File too large (max 50MB)" }
  }

  const fileExt = file.name.split(".").pop()
  const filePath = `${user.id}/intro.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from("videos")
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ video_url: publicUrl })
    .eq("id", user.id)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath("/dashboard")
  return { success: true, data: { video_url: publicUrl } }
}

// ─────────────────────────────────────────────
// VERIFIKATION (Portfolio-Links)
// ─────────────────────────────────────────────

export async function verifyPortfolio(): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("imdb_url, vimeo_url, linkedin_url, portfolio_url")
    .eq("id", user.id)
    .single()

  const hasPortfolioLink = [
    profile?.imdb_url,
    profile?.vimeo_url,
    profile?.linkedin_url,
    profile?.portfolio_url,
  ].some(Boolean)

  if (!hasPortfolioLink) {
    return { success: false, error: "At least one portfolio link required" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
      verification_type: "portfolio",
      verified_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}
