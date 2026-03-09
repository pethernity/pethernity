"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getMessages, sendMessage, subscribeToMessages, type ChatMessage } from "@/lib/chat"
import { ChatMessageItem } from "./chat-message"
import { Button } from "@/components/ui/button"
import { Send, LogIn } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"

export function ChatBoard() {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load initial messages and subscribe to realtime
  useEffect(() => {
    getMessages(100).then(setMessages)

    const channel = subscribeToMessages((msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!user || !newMessage.trim() || sending || cooldown) return

    setSending(true)
    const sent = await sendMessage(user.id, newMessage)
    setSending(false)

    if (sent) {
      setNewMessage("")
      inputRef.current?.focus()

      // 30s cooldown
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100svh-12rem)] flex-col overflow-hidden rounded-2xl border border-rosa-aurora/15 bg-card/40 shadow-lg backdrop-blur-sm">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Nessun messaggio ancora
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Sii il primo a condividere un pensiero
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            isOwn={user?.id === msg.user_id}
          />
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-rosa-aurora/10 bg-background/50 p-4">
        {!user && !loading ? (
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">
              Accedi per partecipare alla comunita
            </p>
            <Button size="sm" onClick={() => setShowAuth(true)}>
              <LogIn className="size-4" />
              Accedi
            </Button>
            <AuthModal
              open={showAuth}
              onOpenChange={setShowAuth}
              onAuthSuccess={() => setShowAuth(false)}
            />
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Condividi un pensiero, un ricordo, una parola di conforto..."
              maxLength={500}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-rosa-aurora/20 bg-background/80 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending || cooldown}
              size="icon"
              className="size-11 shrink-0 rounded-xl"
            >
              <Send className="size-4" />
            </Button>
          </div>
        )}
        {cooldown && (
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            Attendi qualche secondo prima di inviare un altro messaggio
          </p>
        )}
      </div>
    </div>
  )
}
