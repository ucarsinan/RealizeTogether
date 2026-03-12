import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProject } from "@/actions/project.actions"
import { ApplyForm } from "@/components/projects/ApplyForm"

type Params = Promise<{ id: string }>

export default async function ApplyPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/projects/${id}/apply`)

  const result = await getProject(id)
  if (!result.success) notFound()

  const project = result.data
  const creator = project.profiles

  if (creator?.id === user.id) redirect(`/projects/${project.id}`)
  if (project.status !== "open") redirect(`/projects/${project.id}`)

  const isEarlyStage = ["idea", "concept"].includes(project.stage)

  return (
    <div className="min-h-screen bg-zinc-50">
      <ApplyForm
        projectId={project.id}
        projectTitle={project.title}
        roles={project.project_roles ?? []}
        isEarlyStage={isEarlyStage}
      />
    </div>
  )
}
