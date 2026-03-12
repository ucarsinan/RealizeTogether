"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProject, uploadSynopsis, type ProjectRoleInput } from "@/actions/project.actions"
import type { ProjectStage, CommitmentType, CollabType } from "@/lib/types"
import { cn, COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, Users, Lock, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Upload, Info } from "lucide-react"

const STAGES: { value: ProjectStage; hint: string }[] = [
  { value: "idea",        hint: "Vision, no material yet" },
  { value: "concept",     hint: "Concept taking shape" },
  { value: "development", hint: "Actively building" },
  { value: "ready",       hint: "Script/material finished" },
  { value: "production",  hint: "Shooting / in production" },
  { value: "completed",   hint: "Project is done" },
]

const COMMITMENTS: { value: CommitmentType; hint: string }[] = [
  { value: "hobby",        hint: "For the love of it" },
  { value: "side_project", hint: "Serious, but part-time" },
  { value: "serious",      hint: "High ambition, real time" },
  { value: "professional", hint: "Paid production" },
]

const COLLABS: { value: CollabType }[] = [
  { value: "passion" },
  { value: "paid" },
  { value: "both" },
]

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-zinc-600" />
      </div>
      <div>
        <h3 className="font-medium text-sm text-zinc-900">{title}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm px-3 py-2 rounded-lg", type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600")}>
      {type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

function RolesSection({ stage, roles, onChange }: { stage: ProjectStage; roles: ProjectRoleInput[]; onChange: (roles: ProjectRoleInput[]) => void }) {
  const isEarlyStage = ["idea", "concept"].includes(stage)

  function addRole() { onChange([...roles, { role_name: "", quantity: 1, description: "" }]) }
  function removeRole(i: number) { onChange(roles.filter((_, idx) => idx !== i)) }
  function updateRole(i: number, field: keyof ProjectRoleInput, value: string | number) {
    const updated = [...roles]
    updated[i] = { ...updated[i], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className={cn("flex items-start gap-2 text-xs p-3 rounded-lg", isEarlyStage ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        {isEarlyStage ? "Early stage: Add roles broadly. Who could help bring this to life?" : "Ready stage: Be specific. What exact role are you looking for?"}
      </div>

      {roles.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No roles added yet.</p>}

      {roles.map((role, i) => (
        <div key={i} className="bg-zinc-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Role #{i + 1}</span>
            <button type="button" onClick={() => removeRole(i)} className="text-zinc-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Role Name</Label>
              <Input value={role.role_name} onChange={e => updateRole(i, "role_name", e.target.value)} placeholder="e.g. Director of Photography" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Spots</Label>
              <Input type="number" min={1} max={10} value={role.quantity} onChange={e => updateRole(i, "quantity", parseInt(e.target.value) || 1)} className="h-9 text-sm" />
            </div>
          </div>
          {!isEarlyStage && (
            <div className="space-y-1">
              <Label className="text-xs">What are you looking for? (optional)</Label>
              <Textarea value={role.description} onChange={e => updateRole(i, "description", e.target.value)} placeholder="Specific experience, style, availability..." rows={2} className="text-sm resize-none" />
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRole} className="w-full border-dashed">
        <Plus className="w-3.5 h-3.5 mr-2" /> Add Role
      </Button>
    </div>
  )
}

function SynopsisUpload({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("synopsis", file)
    startTransition(async () => {
      const result = await uploadSynopsis(projectId, formData)
      setStatus(result.success
        ? { type: "success", message: "Synopsis uploaded. NDA protection active." }
        : { type: "error", message: result.error }
      )
    })
  }

  return (
    <div className="space-y-3">
      <label htmlFor="synopsis-upload" className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:border-zinc-400 transition-colors">
        {isPending ? <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" /> : <Upload className="w-6 h-6 text-zinc-300" />}
        <span className="text-sm text-zinc-500">{isPending ? "Uploading..." : "Upload Synopsis or Pitch Deck (PDF)"}</span>
        <span className="text-xs text-zinc-400">Max 20MB · Automatically NDA-protected</span>
      </label>
      <input id="synopsis-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isPending} />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

export function ProjectForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    logline: "",
    description: "",
    category: "film",
    stage: "idea" as ProjectStage,
    commitment_type: "serious" as CommitmentType,
    collab_type: "both" as CollabType,
    requires_nda: false,
  })

  const [roles, setRoles] = useState<ProjectRoleInput[]>([])

  function handleChange(field: string, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const isValid = formData.title.trim().length >= 3 && formData.description.trim().length >= 20

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await createProject({ ...formData, roles })
      if (!result.success) {
        setError(result.error)
        return
      }
      setCreatedProjectId(result.data.id)
    })
  }

  if (createdProjectId) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
          <h2 className="font-semibold text-green-800">Project created!</h2>
          <p className="text-sm text-green-700">Optionally upload your synopsis — it will be NDA-protected.</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <SectionHeader icon={Lock} title="Upload Synopsis (Optional)" description="Level 2 of the Trust Funnel — only accessible after NDA consent" />
          <SynopsisUpload projectId={createdProjectId} />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/projects/${createdProjectId}`)}>View Project</Button>
          <Button className="flex-1" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Create Project</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Be honest about stage and commitment — it builds trust</p>
      </div>

      {/* Basics */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <SectionHeader icon={Lightbulb} title="The Project" description="What are you making?" />
        <div className="space-y-1.5">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input id="title" value={formData.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g. Psychological Thriller — Feature Film" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logline">Logline</Label>
          <Input id="logline" value={formData.logline} onChange={e => handleChange("logline", e.target.value)} placeholder="1–2 sentences. Like Se7en meets Inception." />
          <p className="text-xs text-zinc-400">This is always public — make it intriguing</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <Textarea id="description" value={formData.description} onChange={e => handleChange("description", e.target.value)} placeholder="What's the story? What makes it special?" rows={5} className="resize-none" />
          <p className="text-xs text-zinc-400">{formData.description.length} characters (min. 20)</p>
        </div>
      </div>

      {/* Stage & Commitment */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6">
        <SectionHeader icon={Users} title="Expectations" description="These two fields prevent the most frustration" />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Project Stage</Label>
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map(s => (
              <button key={s.value} type="button" onClick={() => handleChange("stage", s.value)}
                className={cn("text-left px-3 py-2.5 rounded-xl border text-sm transition-all",
                  formData.stage === s.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                )}>
                <div className="font-medium">{STAGE_LABELS[s.value]}</div>
                <div className="text-xs mt-0.5 text-zinc-400">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Commitment Level <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-2">
            {COMMITMENTS.map(c => (
              <button key={c.value} type="button" onClick={() => handleChange("commitment_type", c.value)}
                className={cn("text-left px-3 py-2.5 rounded-xl border text-sm transition-all",
                  formData.commitment_type === c.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                )}>
                <div className="font-medium">{COMMITMENT_LABELS[c.value]}</div>
                <div className="text-xs mt-0.5 text-zinc-400">{c.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Collaboration Type <span className="text-red-500">*</span></Label>
          <div className="flex gap-2 flex-wrap">
            {COLLABS.map(c => (
              <button key={c.value} type="button" onClick={() => handleChange("collab_type", c.value)}
                className={cn("px-4 py-2 rounded-full border text-sm transition-all",
                  formData.collab_type === c.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                )}>
                {COLLAB_LABELS[c.value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <SectionHeader icon={Users} title="Roles Needed" description="Who are you looking for?" />
        <RolesSection stage={formData.stage} roles={roles} onChange={setRoles} />
      </div>

      {/* Trust Funnel hint */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-zinc-800">Trust Funnel</p>
            <p className="text-xs text-zinc-500 mt-1">Your logline and description are public. After creating, you can upload a synopsis — NDA-protected (Level 2). Full script stays private in chat (Level 3).</p>
          </div>
        </div>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-zinc-100 -mx-4 px-4 py-3">
        <Button onClick={handleSubmit} disabled={isPending || !isValid} className="w-full" size="lg">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create Project"}
        </Button>
        {!isValid && <p className="text-xs text-center text-zinc-400 mt-2">Title (min. 3 chars) and description (min. 20 chars) required</p>}
      </div>
    </div>
  )
}
