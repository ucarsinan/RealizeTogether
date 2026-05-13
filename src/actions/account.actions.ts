'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/types'

export async function deleteAccount(): Promise<ActionResult<void>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const userId = user.id

  // Clean up storage: avatar + video
  await Promise.allSettled([
    supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]),
    supabase.storage
      .from('videos')
      .list(userId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const paths = data.map((f) => `${userId}/${f.name}`)
          return supabase.storage.from('videos').remove(paths)
        }
      }),
  ])

  // Clean up synopses for projects owned by this user
  const { data: projects } = await supabase.from('projects').select('id').eq('creator_id', userId)

  if (projects && projects.length > 0) {
    await Promise.allSettled(
      projects.map(async (p) => {
        const { data: files } = await supabase.storage.from('synopses').list(p.id)
        if (files && files.length > 0) {
          const paths = files.map((f) => `${p.id}/${f.name}`)
          await supabase.storage.from('synopses').remove(paths)
        }
      })
    )
  }

  // Delete auth user — cascades to profiles and all related rows
  const admin = createAdminClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) return { success: false, error: deleteError.message }

  await supabase.auth.signOut()

  return { success: true, data: undefined }
}
