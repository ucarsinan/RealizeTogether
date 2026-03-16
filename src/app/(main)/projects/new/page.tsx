import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export const metadata = {
  title: 'Create Project – Realize Together',
}

export default async function NewProjectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/projects/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('id', user.id)
    .single()

  const isProfileComplete = profile?.full_name && profile?.bio

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-180 mx-auto px-10 max-md:px-5 py-10">
        <div className="mb-8">
          <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            NEW PROJECT
          </p>
          <Breadcrumb
            items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'New Project' }]}
          />
          <h1 className="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Create a project
          </h1>
        </div>

        {!isProfileComplete && (
          <div className="mb-6 flex items-start gap-3 bg-[#fdf2ec] border border-[#e8621a]/20 rounded-xl p-4">
            <span className="text-[#e8621a] text-lg shrink-0">💡</span>
            <div>
              <p className="font-sans text-[13px] font-medium text-[#1a1918]">
                Complete your profile first
              </p>
              <p className="font-sans text-[12px] text-[#6b6762] mt-0.5">
                Collaborators will check your profile before applying.
              </p>
              <a
                href="/dashboard/profile"
                className="font-sans text-[12px] text-[#e8621a] hover:text-[#c9521a] transition-colors mt-1 inline-block"
              >
                Complete profile →
              </a>
            </div>
          </div>
        )}

        <ProjectForm />
      </div>
    </div>
  )
}
