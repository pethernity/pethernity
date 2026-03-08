import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

// ── Types ──────────────────────────────────────────────────────────

export interface LikeData {
  count: number
  likedByThisBrowser: boolean
}

export interface CandleData {
  count: number
  litByThisBrowser: boolean
}

export interface Comment {
  id: string
  authorName: string
  text: string
  createdAt: string
}

export interface InteractionCounts {
  likes: number
  candles: number
  comments: number
}

// ── Storage helpers (SSR-safe) ─────────────────────────────────────

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStore<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Likes ──────────────────────────────────────────────────────────

const LIKES_KEY = "pethernity-likes"

type LikesStore = Record<string, { count: number; liked: boolean }>

export function getLikes(memorialId: string): LikeData {
  const store = readStore<LikesStore>(LIKES_KEY, {})
  const entry = store[memorialId]
  return entry
    ? { count: entry.count, likedByThisBrowser: entry.liked }
    : { count: 0, likedByThisBrowser: false }
}

export function toggleLike(memorialId: string): LikeData {
  const store = readStore<LikesStore>(LIKES_KEY, {})
  const entry = store[memorialId] ?? { count: 0, liked: false }

  if (entry.liked) {
    entry.count = Math.max(0, entry.count - 1)
    entry.liked = false
  } else {
    entry.count += 1
    entry.liked = true
  }

  store[memorialId] = entry
  writeStore(LIKES_KEY, store)
  return { count: entry.count, likedByThisBrowser: entry.liked }
}

// ── Candles ─────────────────────────────────────────────────────────

const CANDLES_KEY = "pethernity-candles"

type CandlesStore = Record<string, { count: number; lit: boolean }>

export function getCandle(memorialId: string): CandleData {
  const store = readStore<CandlesStore>(CANDLES_KEY, {})
  const entry = store[memorialId]
  return entry
    ? { count: entry.count, litByThisBrowser: entry.lit }
    : { count: 0, litByThisBrowser: false }
}

export function lightCandle(memorialId: string): CandleData {
  const store = readStore<CandlesStore>(CANDLES_KEY, {})
  const entry = store[memorialId] ?? { count: 0, lit: false }

  if (entry.lit) {
    return { count: entry.count, litByThisBrowser: true }
  }

  entry.count += 1
  entry.lit = true
  store[memorialId] = entry
  writeStore(CANDLES_KEY, store)
  return { count: entry.count, litByThisBrowser: true }
}

// ── Comments ────────────────────────────────────────────────────────

const COMMENTS_KEY = "pethernity-comments"

type CommentsStore = Record<string, Comment[]>

export function getComments(memorialId: string): Comment[] {
  const store = readStore<CommentsStore>(COMMENTS_KEY, {})
  const list = store[memorialId] ?? []
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function addComment(
  memorialId: string,
  text: string,
  authorName?: string
): Comment {
  const store = readStore<CommentsStore>(COMMENTS_KEY, {})
  const list = store[memorialId] ?? []

  const comment: Comment = {
    id: crypto.randomUUID(),
    authorName: authorName?.trim() || "Anonimo",
    text: text.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  }

  list.push(comment)
  store[memorialId] = list
  writeStore(COMMENTS_KEY, store)
  return comment
}

// ── Aggregate counts (for map badges) ───────────────────────────────

export function getInteractionCounts(memorialId: string): InteractionCounts {
  return {
    likes: getLikes(memorialId).count,
    candles: getCandle(memorialId).count,
    comments: getComments(memorialId).length,
  }
}

// ── Relative time formatting ────────────────────────────────────────

export function formatRelativeTime(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: it })
}
