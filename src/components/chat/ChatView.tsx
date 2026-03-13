"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import { sendMessage } from "@/actions/conversation.actions"
import type { MessageWithSender } from "@/actions/conversation.actions"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  const myUserIdRef = useRef(myUserId)
  const otherUserRef = useRef(otherUser)
  myUserIdRef.current = myUserId
  otherUserRef.current = otherUser

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
      <div className="bg-white border-b border-[#e0ddd8] px-6 py-4 flex items-center gap-3 shrink-0">
        <Link href="/messages" className="text-[#6b6762] hover:text-[#1a1918] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Avatar className="w-9 h-9 ring-2 ring-[#e0ddd8]">
          <AvatarImage src={otherUser.avatar_url ?? undefined} />
          <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] font-['DM_Sans'] font-bold text-xs">
            {otherUser.full_name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-['DM_Sans'] text-[13px] font-medium text-[#1a1918] truncate">{otherUser.full_name}</p>
          <p className="font-['DM_Sans'] text-[11px] text-[#6b6762] truncate">{projectTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#f2f0ed]">
        {messages.length === 0 && (
          <p className="text-center font-['DM_Sans'] text-[12px] text-[#6b6762] py-12">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === myUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <Avatar className="w-7 h-7 shrink-0 mt-1">
                  <AvatarImage src={otherUser.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] font-['DM_Sans'] text-xs font-bold">
                    {otherUser.full_name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 font-['DM_Sans'] text-[13px] leading-relaxed whitespace-pre-wrap ${
                  isMe
                    ? "bg-[#e8621a] text-white rounded-2xl rounded-tr-sm"
                    : "bg-white border border-[#e0ddd8] text-[#1a1918] rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="font-['DM_Sans'] text-[10px] text-[#6b6762] px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#e0ddd8] px-6 py-4 flex gap-3 items-end shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          className="flex-1 min-h-10 max-h-32 bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 font-['DM_Sans'] text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors resize-none"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          className="bg-[#e8621a] hover:bg-[#c9521a] text-white rounded-full shrink-0 h-10 w-10 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
