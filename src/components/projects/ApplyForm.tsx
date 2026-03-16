'use client'

import { useState, useTransition } from 'react'
import { submitApplication } from '@/actions/application.actions'
import { cn } from '@/lib/utils'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export type Role = { id: string; role_name: string; description: string | null }

interface ApplyFormProps {
  projectId: string
  projectTitle: string
  roles: Role[]
  isEarlyStage: boolean
}

export function ApplyForm({ projectId, projectTitle, roles, isEarlyStage }: ApplyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isValid = message.trim().length >= 30

  function handleSubmit() {
    setStatus(null)
    startTransition(async () => {
      const result = await submitApplication({
        project_id: projectId,
        role_id: selectedRoleId,
        message,
      })

      if (!result.success) {
        setStatus({ type: 'error', message: result.error })
        return
      }

      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="max-w-150 mx-auto px-10 max-md:px-5 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#fdf2ec] flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-[#e8621a]" />
        </div>
        <h2 className="font-unbounded font-bold text-[22px] tracking-[-0.03em] text-[#1a1918]">
          Application sent!
        </h2>
        <p className="font-sans text-[13px] text-[#6b6762] max-w-sm mx-auto leading-relaxed">
          The creator will review your profile and get back to you.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/explore"
            className="border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] font-sans text-[13px] px-5 py-2.5 rounded-full transition-colors"
          >
            Back to Explore
          </Link>
          <Link
            href="/dashboard"
            className="bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold font-sans text-[13px] px-6 py-2.5 rounded-full transition-colors"
          >
            My Applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-150 mx-auto px-10 max-md:px-5 py-10 space-y-6">
      <div className="mb-2">
        <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-2">
          APPLY
        </p>
        <Breadcrumb
          items={[
            { label: 'Explore', href: '/explore' },
            { label: projectTitle, href: `/projects/${projectId}` },
            { label: 'Apply' },
          ]}
        />
        <h1 className="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
          {projectTitle}
        </h1>
      </div>

      {roles.length > 0 && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-3">
          <p className="font-sans text-[12px] font-medium text-[#6b6762]">
            {isEarlyStage ? 'Which role fits you? (optional)' : 'Which role are you applying for?'}
          </p>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(selectedRoleId === role.id ? null : role.id)}
                className={cn(
                  'font-sans text-[12px] font-medium px-4 py-2 rounded-full border transition-colors text-left',
                  selectedRoleId === role.id
                    ? 'border-[#e8621a] bg-[#fdf2ec] text-[#e8621a]'
                    : 'border-[#e0ddd8] text-[#6b6762] hover:border-[#1a1918] hover:text-[#1a1918]'
                )}
              >
                {role.role_name}
                {role.description && (
                  <span className="block text-[10px] mt-0.5 text-[#6b6762]">
                    {role.description}
                  </span>
                )}
              </button>
            ))}
          </div>
          {isEarlyStage && (
            <p className="font-sans text-[11px] text-[#6b6762]">
              Early stage project — you can apply without selecting a specific role
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] space-y-3">
        <label htmlFor="message" className="block font-sans text-[12px] font-medium text-[#6b6762]">
          Why are you the right collaborator? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the creator what draws you to this project, what you bring to the table, and what kind of collaboration you're looking for."
          rows={6}
          className="w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-xl px-5 py-3 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-sans resize-none"
        />
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'font-sans text-[11px] transition-colors',
              message.length < 30 ? 'text-[#6b6762]' : 'text-green-600'
            )}
          >
            {message.length < 30 ? `${30 - message.length} more characters to go` : 'Good length'}
          </p>
          <p className="font-sans text-[11px] text-[#6b6762]">{message.length} chars</p>
        </div>
      </div>

      <div className="bg-[#fdf2ec] rounded-2xl border border-[#e8621a]/20 p-4 font-sans text-[12px] text-[#e8621a] space-y-1">
        <p className="font-medium text-[#1a1918]">Before you apply:</p>
        <ul className="space-y-1 list-disc list-inside text-[#6b6762]">
          <li>Make sure your profile is complete with a bio and portfolio links</li>
          <li>An intro video dramatically increases your acceptance rate</li>
        </ul>
      </div>

      {status?.type === 'error' && (
        <div className="flex items-center gap-2 font-sans text-[12px] text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {status.message}
        </div>
      )}

      {/* Sticky submit */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#e0ddd8] -mx-10 max-md:-mx-5 px-10 max-md:px-5 py-4">
        <button
          onClick={handleSubmit}
          disabled={isPending || !isValid}
          className="w-full bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold font-sans text-[13px] px-6 py-3 rounded-full transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Sending...' : 'Submit application'}
        </button>
        {!isValid && (
          <p className="font-sans text-[11px] text-center text-[#6b6762] mt-2">
            Write at least 30 characters
          </p>
        )}
      </div>
    </div>
  )
}
