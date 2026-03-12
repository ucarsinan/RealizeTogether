import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectForm } from "@/components/projects/ProjectForm"

export const metadata = {
  title: "Create Project – Realize Together",
}

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirectTo=/projects/new")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("id", user.id)
    .single()

  const isProfileComplete = profile?.full_name && profile?.bio

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        {!isProfileComplete && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-amber-500 text-lg">💡</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Complete your profile first</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Collaborators will check your profile before applying.
              </p>
              <a href="/dashboard/profile" className="text-xs text-amber-800 underline mt-1 inline-block">
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
