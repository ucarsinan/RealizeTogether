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
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">

        <div className="mb-8">
          <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            APPLICATIONS
          </p>
          <h1 className="font-['Unbounded'] font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            {project.title}
          </h1>
        </div>

        <ApplicationsManager
          projectId={id}
          projectTitle={project.title}
          applications={applications}
        />

      </div>
    </div>
  )
}
