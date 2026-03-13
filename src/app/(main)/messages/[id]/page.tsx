import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getConversation, markAsRead } from "@/actions/conversation.actions"
import { getMatchStatus } from "@/actions/match.actions"
import { ChatView } from "@/components/chat/ChatView"
import { MatchConfirmBanner } from "@/components/chat/MatchConfirmBanner"
import { Breadcrumb } from "@/components/layout/Breadcrumb"

type Params = Promise<{ id: string }>

export default async function ConversationPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const result = await getConversation(id)
  if (!result.success) notFound()

  const conv = result.data

  const [matchResult] = await Promise.all([
    getMatchStatus(conv.application_id),
    markAsRead(id),
  ])

  const matchStatus = matchResult.success
    ? matchResult.data
    : { creatorConfirmed: false, applicantConfirmed: false, matchedAt: null }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-10 max-md:px-5 pt-4">
        <Breadcrumb items={[
          { label: 'Messages', href: '/messages' },
          { label: conv.other_user.full_name },
        ]} />
      </div>
      <MatchConfirmBanner
        applicationId={conv.application_id}
        applicationStatus={conv.application_status}
        isCreator={conv.is_creator}
        initialStatus={matchStatus}
      />
      <ChatView
        conversationId={conv.id}
        projectTitle={conv.project_title}
        otherUser={conv.other_user}
        initialMessages={conv.messages}
        myUserId={user.id}
      />
    </div>
  )
}
