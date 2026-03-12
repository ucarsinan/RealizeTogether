import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/actions/profile.actions"
import { ProfileForm } from "@/components/profile/ProfileForm"
import type { Profile } from "@/lib/types"

type SearchParams = Promise<{ new?: string }>

export default async function ProfileEditPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const isNew = params.new === "1"

  const result = await getProfile(user.id)

  // New user: profile may not exist yet (depends on whether DB trigger runs)
  // Either way, show the form — empty defaults if no profile
  const profile: Profile = result.success
    ? result.data
    : {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        bio: null,
        avatar_url: null,
        video_url: null,
        portfolio_url: null,
        imdb_url: null,
        vimeo_url: null,
        linkedin_url: null,
        is_verified: false,
        verification_type: "none",
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <ProfileForm profile={profile} isNew={isNew} />
      </div>
    </div>
  )
}
