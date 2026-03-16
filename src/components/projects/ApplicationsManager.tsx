'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptApplication, rejectApplication } from '@/actions/application.actions'
import type { ApplicationWithDetails } from '@/actions/application.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CheckCircle,
  X,
  Play,
  Loader2,
  ArrowLeft,
  MessageCircle,
  Film,
  Linkedin,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'bg-[#f2f0ed] text-[#6b6762] border-[#e0ddd8]' },
  in_talks: { label: 'In Talks', className: 'bg-[#fdf2ec] text-[#e8621a] border-[#e8621a]/20' },
  matched: { label: 'Matched', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-[#f2f0ed] text-[#6b6762] border-[#e0ddd8]' },
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
  const statusConfig = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending

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
    <div
      className={cn(
        'bg-white rounded-2xl border transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        application.status === 'pending' ? 'border-[#e0ddd8]' : 'border-[#e0ddd8] opacity-80'
      )}
    >
      <button className="w-full text-left p-5" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="w-12 h-12 ring-2 ring-[#e0ddd8]">
              <AvatarImage src={applicant.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] font-sans font-bold text-sm">
                {applicant.full_name?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            {applicant.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-1 ring-[#e0ddd8]">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans font-medium text-[#1a1918] text-[13px]">
                {applicant.full_name}
              </span>
              {application.project_roles && (
                <span className="font-sans text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f2f0ed] text-[#6b6762] border border-[#e0ddd8]">
                  {application.project_roles.role_name}
                </span>
              )}
              <span
                className={`font-sans text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="font-sans text-[12px] text-[#6b6762] mt-0.5 line-clamp-1">
              {application.message}
            </p>
          </div>

          <span className="font-sans text-[#6b6762] text-[11px] shrink-0">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="border-t border-[#e0ddd8]" />

          <div>
            <p className="font-sans text-[11px] font-medium text-[#6b6762] uppercase tracking-widest mb-2">
              Application message
            </p>
            <p className="font-sans text-[13px] text-[#1a1918] leading-relaxed whitespace-pre-line">
              {application.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {applicant.video_url && (
              <a
                href={applicant.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] text-[#6b6762] border border-[#e0ddd8] px-3 py-1.5 rounded-full hover:border-[#e8621a] hover:text-[#e8621a] transition-colors"
              >
                <Play className="w-3 h-3" /> Intro Video
              </a>
            )}
            {applicant.imdb_url && (
              <a
                href={applicant.imdb_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] text-[#6b6762] border border-[#e0ddd8] px-3 py-1.5 rounded-full hover:border-[#e8621a] hover:text-[#e8621a] transition-colors"
              >
                <Film className="w-3 h-3" /> IMDb
              </a>
            )}
            {applicant.vimeo_url && (
              <a
                href={applicant.vimeo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] text-[#6b6762] border border-[#e0ddd8] px-3 py-1.5 rounded-full hover:border-[#e8621a] hover:text-[#e8621a] transition-colors"
              >
                <Play className="w-3 h-3" /> Vimeo
              </a>
            )}
            {applicant.linkedin_url && (
              <a
                href={applicant.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] text-[#6b6762] border border-[#e0ddd8] px-3 py-1.5 rounded-full hover:border-[#e8621a] hover:text-[#e8621a] transition-colors"
              >
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
            {applicant.portfolio_url && (
              <a
                href={applicant.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[11px] text-[#6b6762] border border-[#e0ddd8] px-3 py-1.5 rounded-full hover:border-[#e8621a] hover:text-[#e8621a] transition-colors"
              >
                <Globe className="w-3 h-3" /> Portfolio
              </a>
            )}
          </div>

          {application.status === 'pending' && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleReject}
                disabled={isPendingReject || isPendingAccept}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[#e0ddd8] hover:border-red-300 text-[#6b6762] hover:text-red-600 font-sans text-[12px] font-medium px-4 py-2.5 rounded-full transition-colors disabled:opacity-50"
              >
                {isPendingReject ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                Pass
              </button>
              <button
                onClick={handleAccept}
                disabled={isPendingAccept || isPendingReject}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#e8621a] hover:bg-[#c9521a] text-white font-sans text-[12px] font-bold px-4 py-2.5 rounded-full transition-colors disabled:opacity-50"
              >
                {isPendingAccept ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                Start conversation
              </button>
            </div>
          )}

          {application.status === 'in_talks' && (
            <Link
              href="/messages"
              className="flex items-center justify-center gap-1.5 border border-[#e0ddd8] hover:border-[#e8621a] text-[#6b6762] hover:text-[#e8621a] font-sans text-[12px] font-medium px-4 py-2.5 rounded-full transition-colors w-full"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Open conversation
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

export function ApplicationsManager({
  projectId,
  projectTitle: _projectTitle,
  applications: initialApplications,
}: ApplicationsManagerProps) {
  const router = useRouter()
  const [applications, setApplications] = useState(initialApplications)

  function handleAccepted(_conversationId: string) {
    router.push('/messages')
  }

  function handleRejected(applicationId: string) {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'rejected' as const } : a))
    )
  }

  const pending = applications.filter((a) => a.status === 'pending')
  const inTalks = applications.filter((a) => a.status === 'in_talks')
  const matched = applications.filter((a) => a.status === 'matched')
  const rejected = applications.filter((a) => a.status === 'rejected')

  return (
    <div className="space-y-8">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 font-sans text-[13px] text-[#6b6762] hover:text-[#1a1918] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to project
      </Link>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Pending',
            count: pending.length,
            color: 'text-[#e8621a]',
            bg: 'bg-[#fdf2ec] border-[#e8621a]/20',
          },
          {
            label: 'In Talks',
            count: inTalks.length,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'Matched',
            count: matched.length,
            color: 'text-green-600',
            bg: 'bg-green-50 border-green-200',
          },
          {
            label: 'Passed',
            count: rejected.length,
            color: 'text-[#6b6762]',
            bg: 'bg-[#f2f0ed] border-[#e0ddd8]',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl border p-4 text-center`}>
            <p className={`font-unbounded font-bold text-[24px] tracking-[-0.03em] ${stat.color}`}>
              {stat.count}
            </p>
            <p className="font-sans text-[11px] text-[#6b6762] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e0ddd8] rounded-2xl">
          <p className="font-sans text-[13px] text-[#6b6762]">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] font-medium text-[#1a1918] flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e8621a] inline-block" />
                New Applications ({pending.length})
              </h2>
              {pending.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onAccepted={handleAccepted}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )}

          {inTalks.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] font-medium text-[#1a1918] flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                In Conversation ({inTalks.length})
              </h2>
              {inTalks.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onAccepted={handleAccepted}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )}

          {matched.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] font-medium text-[#1a1918] flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Matched ({matched.length})
              </h2>
              {matched.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onAccepted={handleAccepted}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )}

          {rejected.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] font-medium text-[#6b6762] flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e0ddd8] inline-block" />
                Passed ({rejected.length})
              </h2>
              {rejected.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onAccepted={handleAccepted}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
