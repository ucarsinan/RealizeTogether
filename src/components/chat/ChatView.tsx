"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import { sendMessage } from "@/actions/conversation.actions"
import type { MessageWithSender } from "@/actions/conversation.actions"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"

interface ChatViewProps {
  conversationId: string
  projectTitle: string
  otherUser: { id: string; full_name: string; avatar_url: string | null }
  initialMessages: MessageWithSender[]
  myUserId: string
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function ChatView({ conversationId, projectTitle, otherUser, initialMessages, myUserId }: ChatViewProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Stable refs so the effect callback never captures stale props
  const myUserIdRef = useRef(myUserId)
  const otherUserRef = useRef(otherUser)
  myUserIdRef.current = myUserId
  otherUserRef.current = otherUser

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Supabase Realtime subscription — only keyed on conversationId
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newMsg = payload.new as MessageWithSender
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [
              ...prev,
              {
                ...newMsg,
                profiles:
                  newMsg.sender_id === myUserIdRef.current
                    ? null
                    : {
                        id: otherUserRef.current.id,
                        full_name: otherUserRef.current.full_name,
                        avatar_url: otherUserRef.current.avatar_url,
                      },
              },
            ]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  function handleSend() {
    const content = input.trim()
    if (!content || isPending) return
    setInput("")
    startTransition(async () => {
      await sendMessage(conversationId, content)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/messages" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Avatar className="w-8 h-8">
          <AvatarImage src={otherUser.avatar_url ?? undefined} />
          <AvatarFallback className="bg-zinc-100 text-xs">
            {otherUser.full_name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{otherUser.full_name}</p>
          <p className="text-xs text-zinc-400 truncate">{projectTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-zinc-50">
        {messages.length === 0 && (
          <p className="text-center text-xs text-zinc-400 py-12">No messages yet. Say hello!</p>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === myUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <Avatar className="w-7 h-7 shrink-0 mt-1">
                  <AvatarImage src={otherUser.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-zinc-100 text-xs">
                    {otherUser.full_name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isMe
                    ? "bg-zinc-900 text-white rounded-tr-sm"
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-400 px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-zinc-200 px-4 py-3 flex gap-3 items-end shrink-0">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          className="resize-none flex-1 min-h-[40px] max-h-32 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          size="sm"
          className="bg-zinc-900 hover:bg-zinc-800 shrink-0 h-10 w-10 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

    </div>
  )
}
