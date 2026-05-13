import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/actions/project.actions'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

type Params = Promise<{ id: string }>

export default async function EditProjectPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getProject(id)
  if (!result.success) notFound()

  const project = result.data
  if (!user || user.id !== project.creator_id) redirect(`/projects/${id}`)

  const initialData = {
    title: project.title,
    logline: project.logline ?? '',
    description: project.description,
    category: project.category ?? 'film',
    stage: project.stage ?? 'idea',
    commitment_type: project.commitment_type,
    collab_type: project.collab_type,
    requires_nda: project.requires_nda ?? false,
    roles: (project.project_roles ?? []).map((r) => ({
      role_name: r.role_name,
      quantity: r.quantity ?? 1,
      description: r.description ?? '',
    })),
  }

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-2xl mx-auto px-10 max-md:px-5 py-10">
        <Breadcrumb
          items={[
            { label: 'Explore', href: '/explore' },
            { label: project.title, href: `/projects/${id}` },
            { label: 'Edit' },
          ]}
        />
        <div className="mt-6">
          <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-2">
            EDIT PROJECT
          </p>
          <h1 className="font-unbounded font-black text-[28px] tracking-[-0.03em] text-[#1a1918] mb-8">
            {project.title}
          </h1>
          <ProjectForm mode="edit" projectId={id} initialData={initialData} />
        </div>
      </div>
    </div>
  )
}
