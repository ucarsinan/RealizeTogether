import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getApplicationsForProject } from "@/actions/application.actions"
import { ApplicationsManager } from "@/components/projects/ApplicationsManager"

type Params = Promise<{ id: string }>

export default async function ApplicationsPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, creator_id")
    .eq("id", id)
    .single()

  if (!project) notFound()
  if (project.creator_id !== user.id) redirect(`/projects/${id}`)

  const result = await getApplicationsForProject(id)
  const applications = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ApplicationsManager
          projectId={id}
          projectTitle={project.title}
          applications={applications}
        />
      </div>
    </div>
  )
}
