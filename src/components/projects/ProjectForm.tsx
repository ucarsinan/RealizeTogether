'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createProject,
  updateProject,
  uploadSynopsis,
  type ProjectRoleInput,
} from '@/actions/project.actions'
import type { ProjectStage, CommitmentType, CollabType } from '@/lib/types'
import { cn, COMMITMENT_LABELS, STAGE_LABELS, COLLAB_LABELS } from '@/lib/utils'
import {
  Lightbulb,
  Users,
  Lock,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  Info,
} from 'lucide-react'

const STAGES: { value: ProjectStage; hint: string }[] = [
  { value: 'idea', hint: 'Vision, no material yet' },
  { value: 'concept', hint: 'Concept taking shape' },
  { value: 'development', hint: 'Actively building' },
  { value: 'ready', hint: 'Script/material finished' },
  { value: 'production', hint: 'Shooting / in production' },
  { value: 'completed', hint: 'Project is done' },
]

const COMMITMENTS: { value: CommitmentType; hint: string }[] = [
  { value: 'hobby', hint: 'For the love of it' },
  { value: 'side_project', hint: 'Serious, but part-time' },
  { value: 'serious', hint: 'High ambition, real time' },
  { value: 'professional', hint: 'Paid production' },
]

const COLLABS: { value: CollabType }[] = [
  { value: 'passion' },
  { value: 'paid' },
  { value: 'both' },
]

const inputClass =
  'w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-sans'
const textareaClass =
  'w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-xl px-5 py-3 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-sans resize-none'
const labelClass = 'block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5'

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#fdf2ec] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#e8621a]" />
      </div>
      <div>
        <h3 className="font-unbounded font-bold text-[13px] tracking-[-0.01em] text-[#1a1918]">
          {title}
        </h3>
        <p className="font-sans text-[12px] text-[#6b6762] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatusMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-sans text-[12px] px-4 py-2.5 rounded-xl',
        type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  )
}

function RolesSection({
  stage,
  roles,
  onChange,
}: {
  stage: ProjectStage
  roles: ProjectRoleInput[]
  onChange: (roles: ProjectRoleInput[]) => void
}) {
  const isEarlyStage = ['idea', 'concept'].includes(stage)

  function addRole() {
    onChange([...roles, { role_name: '', quantity: 1, description: '' }])
  }
  function removeRole(i: number) {
    onChange(roles.filter((_, idx) => idx !== i))
  }
  function updateRole(i: number, field: keyof ProjectRoleInput, value: string | number) {
    const updated = [...roles]
    updated[i] = { ...updated[i], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex items-start gap-2 font-sans text-[12px] p-3 rounded-xl',
          isEarlyStage ? 'bg-amber-50 text-amber-700' : 'bg-[#fdf2ec] text-[#e8621a]'
        )}
      >
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        {isEarlyStage
          ? 'Early stage: Add roles broadly. Who could help bring this to life?'
          : 'Ready stage: Be specific. What exact role are you looking for?'}
      </div>

      {roles.length === 0 && (
        <p className="font-sans text-[13px] text-[#6b6762] text-center py-4">No roles added yet.</p>
      )}

      {roles.map((role, i) => (
        <div key={i} className="bg-[#f2f0ed] rounded-xl p-4 space-y-3 border border-[#e0ddd8]">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-medium text-[#6b6762]">Role #{i + 1}</span>
            <button
              type="button"
              onClick={() => removeRole(i)}
              className="text-[#6b6762] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Role Name</label>
              <input
                value={role.role_name}
                onChange={(e) => updateRole(i, 'role_name', e.target.value)}
                placeholder="e.g. Director of Photography"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Spots</label>
              <input
                type="number"
                min={1}
                max={10}
                value={role.quantity}
                onChange={(e) => updateRole(i, 'quantity', parseInt(e.target.value) || 1)}
                className={inputClass}
              />
            </div>
          </div>
          {!isEarlyStage && (
            <div>
              <label className={labelClass}>What are you looking for? (optional)</label>
              <textarea
                value={role.description}
                onChange={(e) => updateRole(i, 'description', e.target.value)}
                placeholder="Specific experience, style, availability..."
                rows={2}
                className={textareaClass}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRole}
        className="w-full border border-dashed border-[#e0ddd8] hover:border-[#e8621a] text-[#6b6762] hover:text-[#e8621a] font-sans text-[12px] font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Add Role
      </button>
    </div>
  )
}

function SynopsisUpload({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('synopsis', file)
    startTransition(async () => {
      const result = await uploadSynopsis(projectId, formData)
      setStatus(
        result.success
          ? { type: 'success', message: 'Synopsis uploaded. NDA protection active.' }
          : { type: 'error', message: result.error }
      )
    })
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="synopsis-upload"
        className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[#e0ddd8] hover:border-[#e8621a] hover:bg-[#fdf2ec] rounded-xl cursor-pointer transition-colors"
      >
        {isPending ? (
          <Loader2 className="w-6 h-6 text-[#e8621a] animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-[#e0ddd8]" />
        )}
        <span className="font-sans text-[13px] text-[#6b6762]">
          {isPending ? 'Uploading...' : 'Upload Synopsis or Pitch Deck (PDF)'}
        </span>
        <span className="font-sans text-[11px] text-[#6b6762]">
          Max 20MB · Automatically NDA-protected
        </span>
      </label>
      <input
        id="synopsis-upload"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

type ProjectFormInitialData = {
  title: string
  logline: string
  description: string
  category: string
  stage: ProjectStage
  commitment_type: CommitmentType
  collab_type: CollabType
  requires_nda: boolean
  roles: ProjectRoleInput[]
}

type ProjectFormProps = {
  mode?: 'create' | 'edit'
  projectId?: string
  initialData?: ProjectFormInitialData
}

export function ProjectForm({ mode = 'create', projectId, initialData }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    logline: initialData?.logline ?? '',
    description: initialData?.description ?? '',
    category: initialData?.category ?? 'film',
    stage: (initialData?.stage ?? 'idea') as ProjectStage,
    commitment_type: (initialData?.commitment_type ?? 'serious') as CommitmentType,
    collab_type: (initialData?.collab_type ?? 'both') as CollabType,
    requires_nda: initialData?.requires_nda ?? false,
  })

  const [roles, setRoles] = useState<ProjectRoleInput[]>(initialData?.roles ?? [])

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const isValid = formData.title.trim().length >= 3 && formData.description.trim().length >= 20

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      if (mode === 'edit' && projectId) {
        const result = await updateProject(projectId, { ...formData, roles })
        if (!result.success) {
          setError(result.error)
          return
        }
        router.push(`/projects/${projectId}`)
        return
      }
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
      <div className="space-y-6 pb-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
          <h2 className="font-unbounded font-bold text-[16px] tracking-[-0.02em] text-green-800">
            Project created!
          </h2>
          <p className="font-sans text-[13px] text-green-700">
            Optionally upload your synopsis — it will be NDA-protected.
          </p>
        </div>

        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 space-y-4">
          <SectionHeader
            icon={Lock}
            title="Upload Synopsis (Optional)"
            description="Level 2 of the Trust Funnel — only accessible after NDA consent"
          />
          <SynopsisUpload projectId={createdProjectId} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/projects/${createdProjectId}`)}
            className="flex-1 border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] font-sans text-[13px] px-5 py-2.5 rounded-full transition-colors"
          >
            View Project
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold font-sans text-[13px] px-5 py-2.5 rounded-full transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Basics */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 space-y-5 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <SectionHeader icon={Lightbulb} title="The Project" description="What are you making?" />
        <div>
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Psychological Thriller — Feature Film"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="logline" className={labelClass}>
            Logline
          </label>
          <input
            id="logline"
            value={formData.logline}
            onChange={(e) => handleChange('logline', e.target.value)}
            placeholder="1–2 sentences. Like Se7en meets Inception."
            className={inputClass}
          />
          <p className="font-sans text-[11px] text-[#6b6762] mt-1">
            This is always public — make it intriguing
          </p>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What's the story? What makes it special?"
            rows={5}
            className={textareaClass}
          />
          <p className="font-sans text-[11px] text-[#6b6762] mt-1">
            {formData.description.length} characters (min. 20)
          </p>
        </div>
      </div>

      {/* Stage & Commitment */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 space-y-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <SectionHeader
          icon={Users}
          title="Expectations"
          description="These two fields prevent the most frustration"
        />

        <div className="space-y-2">
          <label className={labelClass}>Project Stage</label>
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleChange('stage', s.value)}
                className={cn(
                  'text-left px-4 py-3 rounded-xl border font-sans text-[13px] transition-colors',
                  formData.stage === s.value
                    ? 'border-[#e8621a] bg-[#fdf2ec] text-[#e8621a]'
                    : 'border-[#e0ddd8] hover:border-[#1a1918] text-[#1a1918]'
                )}
              >
                <div className="font-medium">{STAGE_LABELS[s.value]}</div>
                <div className="text-[11px] mt-0.5 text-[#6b6762]">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e0ddd8]" />

        <div className="space-y-2">
          <label className={labelClass}>
            Commitment Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COMMITMENTS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => handleChange('commitment_type', c.value)}
                className={cn(
                  'text-left px-4 py-3 rounded-xl border font-sans text-[13px] transition-colors',
                  formData.commitment_type === c.value
                    ? 'border-[#e8621a] bg-[#fdf2ec] text-[#e8621a]'
                    : 'border-[#e0ddd8] hover:border-[#1a1918] text-[#1a1918]'
                )}
              >
                <div className="font-medium">{COMMITMENT_LABELS[c.value]}</div>
                <div className="text-[11px] mt-0.5 text-[#6b6762]">{c.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e0ddd8]" />

        <div className="space-y-2">
          <label className={labelClass}>
            Collaboration Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLLABS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => handleChange('collab_type', c.value)}
                className={cn(
                  'px-5 py-2 rounded-full border font-sans text-[13px] transition-colors',
                  formData.collab_type === c.value
                    ? 'border-[#e8621a] bg-[#fdf2ec] text-[#e8621a] font-medium'
                    : 'border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762]'
                )}
              >
                {COLLAB_LABELS[c.value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <SectionHeader icon={Users} title="Roles Needed" description="Who are you looking for?" />
        <RolesSection stage={formData.stage} roles={roles} onChange={setRoles} />
      </div>

      {/* Trust Funnel hint */}
      <div className="flex items-start gap-3 bg-white border border-[#e0ddd8] rounded-2xl p-5">
        <Lock className="w-4 h-4 text-[#e8621a] mt-0.5 shrink-0" />
        <div>
          <p className="font-sans text-[13px] font-medium text-[#1a1918]">Trust Funnel</p>
          <p className="font-sans text-[12px] text-[#6b6762] mt-1 leading-relaxed">
            Your logline and description are public. After creating, you can upload a synopsis —
            NDA-protected (Level 2). Full script stays private in chat (Level 3).
          </p>
        </div>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      {/* Sticky submit */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#e0ddd8] -mx-10 max-md:-mx-5 px-10 max-md:px-5 py-4">
        <button
          onClick={handleSubmit}
          disabled={isPending || !isValid}
          className="w-full bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold font-sans text-[13px] px-6 py-3 rounded-full transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending
            ? mode === 'edit'
              ? 'Saving...'
              : 'Creating...'
            : mode === 'edit'
              ? 'Save Changes'
              : 'Create Project'}
        </button>
        {!isValid && (
          <p className="font-sans text-[11px] text-center text-[#6b6762] mt-2">
            Title (min. 3 chars) and description (min. 20 chars) required
          </p>
        )}
      </div>
    </div>
  )
}
