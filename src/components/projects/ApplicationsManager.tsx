"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { acceptApplication, rejectApplication } from "@/actions/application.actions"
import type { ApplicationWithDetails } from "@/actions/application.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, X, Play, Loader2, ArrowLeft, MessageCircle, Film, Linkedin, Globe } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  in_talks: { label: "In Talks", className: "bg-blue-50 text-blue-700 border-blue-200" },
  matched:  { label: "Matched",  className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejected", className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

function ApplicationCard({
  application,
  onAccepted,
  onRejected,
}: {
  application: ApplicationWithDetails
  onAccepted: (conversationId: string) => void
  onRejected: (id: string) => void
}) {
  const [isPendingAccept, startAccept] = useTransition()
  const [isPendingReject, startReject] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)

  const applicant = application.profiles
  const statusConfig = STATUS_CONFIG[application.status]

  function handleAccept() {
    startAccept(async () => {
      const result = await acceptApplication(application.id)
      if (result.success) onAccepted(result.data.conversationId)
    })
  }

  function handleReject() {
    startReject(async () => {
      const result = await rejectApplication(application.id)
      if (result.success) onRejected(application.id)
    })
  }

  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all",
      application.status === "pending" ? "border-zinc-200" : "border-zinc-100 opacity-75"
    )}>
      <button className="w-full text-left p-5" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={applicant.avatar_url ?? undefined} />
              <AvatarFallback className="bg-zinc-100 text-sm font-medium">
                {applicant.full_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            {applicant.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-zinc-900 text-sm">{applicant.full_name}</span>
              {application.project_roles && (
                <Badge variant="secondary" className="text-xs">{application.project_roles.role_name}</Badge>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{application.message}</p>
          </div>

          <span className="text-zinc-400 text-xs shrink-0">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <Separator />

          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">Application message</p>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{application.message}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {applicant.video_url && (
              <a href={applicant.video_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors">
                <Play className="w-3 h-3" /> Intro Video
              </a>
            )}
            {applicant.imdb_url && (
              <a href={applicant.imdb_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors">
                <Film className="w-3 h-3" /> IMDb
              </a>
            )}
            {applicant.vimeo_url && (
              <a href={applicant.vimeo_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors">
                <Play className="w-3 h-3" /> Vimeo
              </a>
            )}
            {applicant.linkedin_url && (
              <a href={applicant.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
            {applicant.portfolio_url && (
              <a href={applicant.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-colors">
                <Globe className="w-3 h-3" /> Portfolio
              </a>
            )}
          </div>

          {application.status === "pending" && (
            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleReject}
                disabled={isPendingReject || isPendingAccept}
                variant="outline" size="sm"
                className="flex-1 text-zinc-500 hover:text-red-600 hover:border-red-300"
              >
                {isPendingReject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                Pass
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isPendingAccept || isPendingReject}
                size="sm" className="flex-1 bg-zinc-900 hover:bg-zinc-800"
              >
                {isPendingAccept
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  : <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                }
                Start conversation
              </Button>
            </div>
          )}

          {application.status === "in_talks" && (
            <Link href="/messages">
              <Button size="sm" variant="outline" className="w-full">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Open conversation
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

interface ApplicationsManagerProps {
  projectId: string
  projectTitle: string
  applications: ApplicationWithDetails[]
}

export function ApplicationsManager({ projectId, projectTitle, applications: initialApplications }: ApplicationsManagerProps) {
  const router = useRouter()
  const [applications, setApplications] = useState(initialApplications)

  function handleAccepted(_conversationId: string) {
    router.push("/messages")
  }

  function handleRejected(applicationId: string) {
    setApplications(prev =>
      prev.map(a => a.id === applicationId ? { ...a, status: "rejected" as const } : a)
    )
  }

  const pending  = applications.filter(a => a.status === "pending")
  const inTalks  = applications.filter(a => a.status === "in_talks")
  const matched  = applications.filter(a => a.status === "matched")
  const rejected = applications.filter(a => a.status === "rejected")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${projectId}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Applications</h1>
          <p className="text-sm text-zinc-500">{projectTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending",  count: pending.length,  color: "text-amber-600" },
          { label: "In Talks", count: inTalks.length,  color: "text-blue-600" },
          { label: "Matched",  count: matched.length,  color: "text-green-600" },
          { label: "Passed",   count: rejected.length, color: "text-zinc-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-zinc-200 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-sm">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                New Applications ({pending.length})
              </h2>
              {pending.map(app => (
                <ApplicationCard key={app.id} application={app} onAccepted={handleAccepted} onRejected={handleRejected} />
              ))}
            </div>
          )}

          {inTalks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                In Conversation ({inTalks.length})
              </h2>
              {inTalks.map(app => (
                <ApplicationCard key={app.id} application={app} onAccepted={handleAccepted} onRejected={handleRejected} />
              ))}
            </div>
          )}

          {matched.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Matched ({matched.length})
              </h2>
              {matched.map(app => (
                <ApplicationCard key={app.id} application={app} onAccepted={handleAccepted} onRejected={handleRejected} />
              ))}
            </div>
          )}

          {rejected.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                Passed ({rejected.length})
              </h2>
              {rejected.map(app => (
                <ApplicationCard key={app.id} application={app} onAccepted={handleAccepted} onRejected={handleRejected} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
