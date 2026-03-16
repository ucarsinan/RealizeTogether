import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/profile.actions'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import type { Profile } from '@/lib/types'

type SearchParams = Promise<{ new?: string }>

export default async function ProfileEditPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const isNew = params.new === '1'

  const result = await getProfile(user.id)

  const profile: Profile = result.success
    ? result.data
    : {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? '',
        bio: null,
        avatar_url: null,
        video_url: null,
        portfolio_url: null,
        imdb_url: null,
        vimeo_url: null,
        linkedin_url: null,
        is_verified: false,
        verification_type: 'none',
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
        <div className="mb-8">
          <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            YOUR PROFILE
          </p>
          <Breadcrumb
            items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Edit Profile' }]}
          />
          <h1 className="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            {isNew ? 'Complete your profile' : 'Edit profile'}
          </h1>
        </div>

        <div className="bg-white border border-[#e0ddd8] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-8 max-w-2xl">
          <ProfileForm profile={profile} isNew={isNew} />
        </div>
      </div>
    </div>
  )
}
