'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'
import { sendEmail } from '@/lib/email/resend'
import { newMessageEmail } from '@/lib/email/templates'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ConversationPreview = {
  id: string
  application_id: string
  project_id: string
  project_title: string
  other_user: { id: string; full_name: string; avatar_url: string | null }
  last_message: { content: string; created_at: string; is_mine: boolean } | null
  unread_count: number
}

export type MessageWithSender = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
  profiles: { id: string; full_name: string; avatar_url: string | null } | null
}

export type ConversationDetail = {
  id: string
  application_id: string
  project_id: string
  project_title: string
  other_user: { id: string; full_name: string; avatar_url: string | null }
  application_status: string
  is_creator: boolean
  messages: MessageWithSender[]
}

// ─────────────────────────────────────────────
// ALLE CONVERSATIONS LADEN
// ─────────────────────────────────────────────

export async function getMyConversations(): Promise<ActionResult<ConversationPreview[]>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const [{ data: myProjects }, { data: myApps }] = await Promise.all([
    supabase.from('projects').select('id').eq('creator_id', user.id),
    supabase.from('project_applications').select('id').eq('applicant_id', user.id),
  ])

  const projectIds = (myProjects ?? []).map((p) => p.id)
  const appIds = (myApps ?? []).map((a) => a.id)

  if (projectIds.length === 0 && appIds.length === 0) {
    return { success: true, data: [] }
  }

  const results: ConversationPreview[] = []

  // Conversations as creator — other user = applicant
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from('conversations')
      .select(
        `
        id, project_id, application_id,
        projects(id, title),
        project_applications(applicant_id, profiles(id, full_name, avatar_url)),
        messages(id, content, sender_id, created_at, read_at)
      `
      )
      .in('project_id', projectIds)

    for (const conv of data ?? []) {
      const msgs = sortDesc(conv.messages as RawMessage[])
      const lastMsg = msgs[0] ?? null
      const app = conv.project_applications as unknown as {
        applicant_id: string
        profiles: OtherUser
      }

      results.push({
        id: conv.id,
        application_id: conv.application_id,
        project_id: conv.project_id,
        project_title: (conv.projects as unknown as { title: string })?.title ?? 'Project',
        other_user: app?.profiles ?? UNKNOWN_USER,
        last_message: lastMsg ? toLastMsg(lastMsg, user.id) : null,
        unread_count: msgs.filter((m) => m.sender_id !== user.id && !m.read_at).length,
      })
    }
  }

  // Conversations as applicant — other user = creator
  if (appIds.length > 0) {
    const { data } = await supabase
      .from('conversations')
      .select(
        `
        id, project_id, application_id,
        projects(id, title, profiles(id, full_name, avatar_url)),
        messages(id, content, sender_id, created_at, read_at)
      `
      )
      .in('application_id', appIds)

    for (const conv of data ?? []) {
      if (results.find((r) => r.id === conv.id)) continue

      const msgs = sortDesc(conv.messages as RawMessage[])
      const lastMsg = msgs[0] ?? null
      const project = conv.projects as unknown as { title: string; profiles: OtherUser }

      results.push({
        id: conv.id,
        application_id: conv.application_id,
        project_id: conv.project_id,
        project_title: project?.title ?? 'Project',
        other_user: project?.profiles ?? UNKNOWN_USER,
        last_message: lastMsg ? toLastMsg(lastMsg, user.id) : null,
        unread_count: msgs.filter((m) => m.sender_id !== user.id && !m.read_at).length,
      })
    }
  }

  results.sort((a, b) => {
    const at = a.last_message?.created_at ?? '0'
    const bt = b.last_message?.created_at ?? '0'
    return bt.localeCompare(at)
  })

  return { success: true, data: results }
}

// ─────────────────────────────────────────────
// EINZELNE CONVERSATION LADEN
// ─────────────────────────────────────────────

export async function getConversation(id: string): Promise<ActionResult<ConversationDetail>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { data: conv, error } = await supabase
    .from('conversations')
    .select(
      `
      id, project_id, application_id,
      projects(id, title, creator_id, profiles(id, full_name, avatar_url)),
      project_applications(applicant_id, status, profiles(id, full_name, avatar_url)),
      messages(id, conversation_id, sender_id, content, read_at, created_at, profiles(id, full_name, avatar_url))
    `
    )
    .eq('id', id)
    .single()

  if (error || !conv) return { success: false, error: 'Conversation not found' }

  const project = conv.projects as unknown as {
    title: string
    creator_id: string
    profiles: OtherUser
  }
  const application = conv.project_applications as unknown as {
    applicant_id: string
    status: string
    profiles: OtherUser
  }

  if (user.id !== project?.creator_id && user.id !== application?.applicant_id) {
    return { success: false, error: 'Not authorized' }
  }

  const isCreator = user.id === project?.creator_id
  const otherUser: OtherUser = isCreator
    ? (application?.profiles ?? UNKNOWN_USER)
    : (project?.profiles ?? UNKNOWN_USER)

  const messages = ((conv.messages as unknown as MessageWithSender[]) ?? []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    success: true,
    data: {
      id: conv.id,
      application_id: conv.application_id,
      project_id: conv.project_id,
      project_title: project?.title ?? 'Project',
      other_user: otherUser,
      application_status: application?.status ?? 'in_talks',
      is_creator: isCreator,
      messages,
    },
  }
}

// ─────────────────────────────────────────────
// NACHRICHT SENDEN
// ─────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const trimmed = content.trim()
  if (!trimmed) return { success: false, error: 'Message cannot be empty' }

  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, content: trimmed })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/messages/${conversationId}`)

  // Email: notify recipient of new message, rate-limited to once per hour per conversation (fire-and-forget)
  void (async () => {
    try {
      // Load conversation to determine other party + project title
      const { data: conv } = await supabase
        .from('conversations')
        .select('project_id, projects(title, creator_id), project_applications(applicant_id)')
        .eq('id', conversationId)
        .single()

      if (!conv) return

      const proj = conv.projects as unknown as { title: string; creator_id: string }
      const app = conv.project_applications as unknown as { applicant_id: string }
      const recipientId = user.id === proj.creator_id ? app.applicant_id : proj.creator_id

      // Rate-limit: skip if sender already sent a message in this conversation within the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('sender_id', user.id)
        .gt('created_at', oneHourAgo)
        .limit(2)

      // If there's more than the message we just inserted, skip (already notified within the hour)
      if ((recentMsgs?.length ?? 0) > 1) return

      const admin = createAdminClient()
      const [{ data: recipientAuth }, { data: senderProfile }] = await Promise.all([
        admin.auth.admin.getUserById(recipientId),
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      ])

      const recipientEmail = recipientAuth?.user?.email
      if (recipientEmail) {
        const { subject, html } = newMessageEmail({
          senderName: senderProfile?.full_name ?? 'Someone',
          projectTitle: proj.title,
          preview: trimmed,
          conversationId,
        })
        await sendEmail({ to: recipientEmail, subject, html })
      }
    } catch (e) {
      console.error('[email] newMessage error:', e)
    }
  })()

  return { success: true, data: undefined }
}

// ─────────────────────────────────────────────
// GELESEN MARKIEREN
// ─────────────────────────────────────────────

export async function markAsRead(conversationId: string): Promise<ActionResult<undefined>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  if (error) return { success: false, error: error.message }

  revalidatePath('/messages')
  return { success: true, data: undefined }
}

// ─────────────────────────────────────────────
// HELPERS (private)
// ─────────────────────────────────────────────

type OtherUser = { id: string; full_name: string; avatar_url: string | null }
type RawMessage = {
  id: string
  content: string
  sender_id: string
  created_at: string
  read_at: string | null
}

const UNKNOWN_USER: OtherUser = { id: '?', full_name: 'Unknown', avatar_url: null }

function sortDesc(msgs: RawMessage[]): RawMessage[] {
  return [...(msgs ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

function toLastMsg(msg: RawMessage, myId: string) {
  return { content: msg.content, created_at: msg.created_at, is_mine: msg.sender_id === myId }
}
