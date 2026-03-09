import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

// ── Types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  user_id: string
  author_name: string
  message: string
  created_at: string
}

// ── Queries ────────────────────────────────────────────────────────

export async function getMessages(limit = 50): Promise<ChatMessage[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, user_id, message, created_at, profiles(display_name)")
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    author_name: row.profiles?.display_name || "Anonimo",
    message: row.message,
    created_at: row.created_at,
  }))
}

export async function sendMessage(
  userId: string,
  message: string
): Promise<ChatMessage | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: userId,
      message: message.trim().slice(0, 500),
    })
    .select("id, user_id, message, created_at, profiles(display_name)")
    .single()

  if (error || !data) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  return {
    id: row.id,
    user_id: row.user_id,
    author_name: row.profiles?.display_name || "Anonimo",
    message: row.message,
    created_at: row.created_at,
  }
}

// ── Realtime ───────────────────────────────────────────────────────

export function subscribeToMessages(
  onNewMessage: (msg: ChatMessage) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel("chat_messages_realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      async (payload) => {
        // Fetch full message with profile join
        const { data } = await supabase
          .from("chat_messages")
          .select("id, user_id, message, created_at, profiles(display_name)")
          .eq("id", payload.new.id)
          .single()

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row = data as any
          onNewMessage({
            id: row.id,
            user_id: row.user_id,
            author_name: row.profiles?.display_name || "Anonimo",
            message: row.message,
            created_at: row.created_at,
          })
        }
      }
    )
    .subscribe()

  return channel
}
