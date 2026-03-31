import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/profile.actions'
import { ProfileView } from '@/components/profile/ProfileView'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

type Params = Promise<{ id: string }>

export default async function PublicProfilePage({ params }: { params: Params }) {
  const { id } = await params

  const result = await getProfile(id)
  if (!result.success) notFound()

  const profile = result.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === profile.id

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Explore', href: '/explore' },
            { label: profile.full_name ?? 'Profile' },
          ]}
        />
        <ProfileView profile={profile} isOwner={isOwner} />
      </div>
    </div>
  )
}
