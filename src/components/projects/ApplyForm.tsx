"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitApplication } from "@/actions/application.actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export type Role = { id: string; role_name: string; description: string | null }

interface ApplyFormProps {
  projectId: string
  projectTitle: string
  roles: Role[]
  isEarlyStage: boolean
}

export function ApplyForm({ projectId, projectTitle, roles, isEarlyStage }: ApplyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
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
        setStatus({ type: "error", message: result.error })
        return
      }

      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900">Application sent!</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          The creator will review your profile and get back to you.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/explore"><Button variant="outline">Back to Explore</Button></Link>
          <Link href="/dashboard"><Button>My Applications</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to project
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Apply to collaborate</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{projectTitle}</p>
      </div>

      {roles.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
          <Label className="text-sm font-medium">
            {isEarlyStage ? "Which role fits you? (optional)" : "Which role are you applying for?"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(selectedRoleId === role.id ? null : role.id)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-sm transition-all text-left",
                  selectedRoleId === role.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 hover:border-zinc-400 text-zinc-700"
                )}
              >
                {role.role_name}
                {role.description && (
                  <span className={cn("block text-xs mt-0.5", selectedRoleId === role.id ? "text-zinc-400" : "text-zinc-400")}>
                    {role.description}
                  </span>
                )}
              </button>
            ))}
          </div>
          {isEarlyStage && (
            <p className="text-xs text-zinc-400">Early stage project — you can apply without selecting a specific role</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
        <Label htmlFor="message" className="text-sm font-medium">
          Why are you the right collaborator? <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell the creator what draws you to this project, what you bring to the table, and what kind of collaboration you're looking for."
          rows={6}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <p className={cn("text-xs transition-colors", message.length < 30 ? "text-zinc-400" : "text-green-600")}>
            {message.length < 30 ? `${30 - message.length} more characters to go` : "✓ Good length"}
          </p>
          <p className="text-xs text-zinc-400">{message.length} chars</p>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-xs text-amber-700 space-y-1">
        <p className="font-medium">Before you apply:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Make sure your profile is complete with a bio and portfolio links</li>
          <li>An intro video dramatically increases your acceptance rate</li>
        </ul>
      </div>

      {status?.type === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {status.message}
        </div>
      )}

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-zinc-100 -mx-4 px-4 py-3">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !isValid}
          className="w-full bg-zinc-900 hover:bg-zinc-800"
          size="lg"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isPending ? "Sending..." : "Send Application →"}
        </Button>
        {!isValid && (
          <p className="text-xs text-center text-zinc-400 mt-2">Write at least 30 characters</p>
        )}
      </div>
    </div>
  )
}
