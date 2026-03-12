import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getMyConversations } from "@/actions/conversation.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const result = await getMyConversations()
  const conversations = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-zinc-500" />
          <h1 className="text-sm font-medium text-zinc-800">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-1">
            <p className="text-sm text-zinc-500">No conversations yet.</p>
            <p className="text-xs text-zinc-400">They appear once an application is accepted.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="bg-white rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors flex items-center gap-4">

                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conv.other_user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-zinc-100 text-sm">
                        {conv.other_user.full_name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-zinc-900 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${conv.unread_count > 0 ? "font-semibold text-zinc-900" : "font-medium text-zinc-800"}`}>
                        {conv.other_user.full_name}
                      </span>
                      {conv.last_message && (
                        <span className="text-xs text-zinc-400 shrink-0">
                          {timeAgo(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{conv.project_title}</p>
                    {conv.last_message && (
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? "font-medium text-zinc-700" : "text-zinc-400"}`}>
                        {conv.last_message.is_mine ? "You: " : ""}{conv.last_message.content}
                      </p>
                    )}
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
