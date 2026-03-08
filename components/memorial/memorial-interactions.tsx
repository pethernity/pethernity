"use client"

import { useEffect, useState } from "react"
import {
  Heart,
  Flame,
  Star,
  MessageCircle,
  Send,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  type LikeData,
  type CandleData,
  type Comment,
  getLikes,
  toggleLike,
  getCandle,
  lightCandle,
  getComments,
  addComment,
  formatRelativeTime,
} from "@/lib/interactions"

interface MemorialInteractionsProps {
  memorialId: string
  petName: string
}

export function MemorialInteractions({
  memorialId,
  petName,
}: MemorialInteractionsProps) {
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, likedByThisBrowser: false })
  const [candleData, setCandleData] = useState<CandleData>({ count: 0, litByThisBrowser: false })
  const [comments, setComments] = useState<Comment[]>([])
  const [showCandle, setShowCandle] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    setLikeData(getLikes(memorialId))
    const candle = getCandle(memorialId)
    setCandleData(candle)
    setShowCandle(candle.litByThisBrowser)
    setComments(getComments(memorialId))
  }, [memorialId])

  function handleLike() {
    const updated = toggleLike(memorialId)
    setLikeData(updated)
    if (updated.likedByThisBrowser) {
      toast(`Un cuore per ${petName}`)
    }
  }

  function handleCandle() {
    if (candleData.litByThisBrowser) return
    const updated = lightCandle(memorialId)
    setCandleData(updated)
    setShowCandle(true)
    toast("La tua luce riscalda il suo ricordo")
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    const comment = addComment(memorialId, commentText, authorName)
    setComments((prev) => [comment, ...prev])
    setCommentText("")
    setAuthorName("")
    toast("Pensiero condiviso")
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Decorative separator */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rosa-aurora/30" />
        <Star className="size-4 text-oro-antico" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rosa-aurora/30" />
      </div>

      {/* Like + Candle buttons */}
      <div className="flex items-center justify-center gap-6">
        {/* Like button */}
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
            likeData.likedByThisBrowser
              ? "bg-rosa-aurora/20 ring-2 ring-rosa-aurora/30"
              : "bg-card/60 hover:bg-card/80"
          )}
        >
          <Heart
            className={cn(
              "size-5 transition-colors",
              likeData.likedByThisBrowser
                ? "fill-rosa-aurora text-rosa-aurora"
                : "text-muted-foreground"
            )}
          />
          <span>{likeData.count}</span>
          <span className="text-muted-foreground">
            {likeData.count === 1 ? "cuore" : "cuori"}
          </span>
        </button>

        {/* Candle button */}
        <button
          onClick={handleCandle}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
            candleData.litByThisBrowser
              ? "bg-oro-antico/20 ring-2 ring-oro-antico/30"
              : "bg-card/60 hover:bg-card/80"
          )}
        >
          <Flame
            className={cn(
              "size-5 transition-colors",
              candleData.litByThisBrowser
                ? "animate-pulse fill-oro-antico text-oro-antico"
                : "text-muted-foreground"
            )}
          />
          <span>{candleData.count}</span>
          <span className="text-muted-foreground">
            {candleData.count === 1 ? "candela" : "candele"}
          </span>
        </button>
      </div>

      {/* Candle animation */}
      {showCandle && (
        <div className="flex animate-fade-up flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute size-20 rounded-full bg-oro-antico/20 blur-xl" />
            <span className="relative animate-float text-5xl">🕯️</span>
          </div>
          <p className="text-sm italic text-muted-foreground">
            Una luce accesa in memoria di {petName}
          </p>
        </div>
      )}

      {/* Comments section */}
      <div className="w-full space-y-6">
        {/* Heading */}
        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <MessageCircle className="size-5 text-muted-foreground" />
          <h3 className="font-display text-xl font-bold">Pensieri e ricordi</h3>
          {comments.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {comments.length}
            </Badge>
          )}
        </div>

        {/* Comment form */}
        <form
          onSubmit={handleComment}
          className="rounded-2xl bg-card/60 p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="space-y-4">
            <Input
              placeholder="Il tuo nome (opzionale)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-white/50"
            />
            <Textarea
              placeholder={`Scrivi un pensiero per ${petName}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              className="min-h-24 bg-white/50"
            />
            <Button
              type="submit"
              disabled={!commentText.trim()}
              className="w-full"
            >
              <Send className="size-4" />
              Invia pensiero
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="animate-fade-up rounded-xl bg-card/60 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-celeste-paradiso/30">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
