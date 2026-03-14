import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyConversations } from '@/actions/conversation.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getMyConversations()
  const conversations = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-3">
            MESSAGES
          </p>
          <h1 className="font-['Unbounded'] font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
            Conversations
          </h1>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white border border-[#e0ddd8] rounded-2xl p-16 text-center shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
            <p className="font-['DM_Sans'] text-[13px] text-[#6b6762]">No conversations yet.</p>
            <p className="font-['DM_Sans'] text-[12px] text-[#6b6762]/60 mt-1">
              They appear once an application is accepted.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="bg-white border border-[#e0ddd8] hover:border-[#e8621a] rounded-2xl p-5 transition-colors flex items-center gap-4 group shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {/* Avatar + unread badge */}
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11 ring-2 ring-[#e0ddd8] group-hover:ring-[#e8621a] transition-colors">
                      <AvatarImage src={conv.other_user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] font-['DM_Sans'] font-bold text-sm">
                        {conv.other_user.full_name?.[0]?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e8621a] rounded-full text-white text-[10px] flex items-center justify-center font-['DM_Sans'] font-bold">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-['DM_Sans'] text-[14px] truncate ${conv.unread_count > 0 ? 'font-bold text-[#1a1918]' : 'font-medium text-[#1a1918]'}`}
                      >
                        {conv.other_user.full_name}
                      </span>
                      {conv.last_message && (
                        <span className="font-['DM_Sans'] text-[11px] text-[#6b6762] shrink-0">
                          {timeAgo(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="font-['DM_Sans'] text-[12px] text-[#6b6762] truncate mt-0.5">
                      {conv.project_title}
                    </p>
                    {conv.last_message && (
                      <p
                        className={`font-['DM_Sans'] text-[12px] truncate mt-0.5 ${conv.unread_count > 0 ? 'font-medium text-[#1a1918]' : 'text-[#6b6762]'}`}
                      >
                        {conv.last_message.is_mine ? 'You: ' : ''}
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>

                  {/* Active indicator */}
                  <div
                    className={`w-1 self-stretch rounded-full transition-colors ${conv.unread_count > 0 ? 'bg-[#e8621a]' : 'bg-transparent'}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
