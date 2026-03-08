import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

// ── Types ──────────────────────────────────────────────────────────

export interface LikeData {
  count: number
  likedByCurrentUser: boolean
}

export interface CandleData {
  count: number
  litByCurrentUser: boolean
}

export interface Comment {
  id: string
  user_id: string
  author_name: string
  text: string
  created_at: string
}

export interface InteractionCounts {
  likes: number
  candles: number
  comments: number
}

// ── Likes ──────────────────────────────────────────────────────────

export async function getLikes(
  memorialId: string,
  userId: string | null
): Promise<LikeData> {
  const supabase = createClient()

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorialId)

  let likedByCurrentUser = false
  if (userId) {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("user_id", userId)
      .maybeSingle()
    likedByCurrentUser = !!data
  }

  return { count: count ?? 0, likedByCurrentUser }
}

export async function toggleLike(
  memorialId: string,
  userId: string
): Promise<LikeData> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("memorial_id", memorialId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id)
  } else {
    await supabase
      .from("likes")
      .insert({ memorial_id: memorialId, user_id: userId })
  }

  return getLikes(memorialId, userId)
}

// ── Candles ─────────────────────────────────────────────────────────

export async function getCandle(
  memorialId: string,
  userId: string | null
): Promise<CandleData> {
  const supabase = createClient()

  const { count } = await supabase
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorialId)

  let litByCurrentUser = false
  if (userId) {
    const { data } = await supabase
      .from("candles")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("user_id", userId)
      .maybeSingle()
    litByCurrentUser = !!data
  }

  return { count: count ?? 0, litByCurrentUser }
}

export async function lightCandle(
  memorialId: string,
  userId: string
): Promise<CandleData> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("candles")
    .select("id")
    .eq("memorial_id", memorialId)
    .eq("user_id", userId)
    .maybeSingle()

  if (!existing) {
    await supabase
      .from("candles")
      .insert({ memorial_id: memorialId, user_id: userId })
  }

  return getCandle(memorialId, userId)
}

// ── Comments ────────────────────────────────────────────────────────

export async function getComments(memorialId: string): Promise<Comment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("comments")
    .select("id, user_id, text, created_at, profiles(display_name)")
    .eq("memorial_id", memorialId)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    author_name: c.profiles?.display_name || "Anonimo",
    text: c.text,
    created_at: c.created_at,
  }))
}

export async function addComment(
  memorialId: string,
  userId: string,
  text: string
): Promise<Comment | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("comments")
    .insert({
      memorial_id: memorialId,
      user_id: userId,
      text: text.trim().slice(0, 500),
    })
    .select("id, user_id, text, created_at, profiles(display_name)")
    .single()

  if (error || !data) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  return {
    id: row.id,
    user_id: row.user_id,
    author_name: row.profiles?.display_name || "Anonimo",
    text: row.text,
    created_at: row.created_at,
  }
}

// ── Aggregate counts ───────────────────────────────────────────────

export async function getInteractionCounts(
  memorialId: string
): Promise<InteractionCounts> {
  const supabase = createClient()

  const [likes, candles, comments] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
    supabase
      .from("candles")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
  ])

  return {
    likes: likes.count ?? 0,
    candles: candles.count ?? 0,
    comments: comments.count ?? 0,
  }
}

// ── Relative time formatting ────────────────────────────────────────

export function formatRelativeTime(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: it })
}
