"use client"

import { useEffect, useState } from "react"
import {
  Heart,
  Flame,
  Star,
  MessageCircle,
  Send,
  User,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"

interface MemorialInteractionsProps {
  memorialId: string
  petName: string
}

export function MemorialInteractions({
  memorialId,
  petName,
}: MemorialInteractionsProps) {
  const { user } = useAuth()
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, likedByCurrentUser: false })
  const [candleData, setCandleData] = useState<CandleData>({ count: 0, litByCurrentUser: false })
  const [comments, setComments] = useState<Comment[]>([])
  const [showCandle, setShowCandle] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      const [likes, candle, commentList] = await Promise.all([
        getLikes(memorialId, user?.id ?? null),
        getCandle(memorialId, user?.id ?? null),
        getComments(memorialId),
      ])
      setLikeData(likes)
      setCandleData(candle)
      setShowCandle(candle.litByCurrentUser)
      setComments(commentList)
    }
    load()
  }, [memorialId, user?.id])

  function requireAuth(action: () => void) {
    if (!user) {
      setShowAuth(true)
      return
    }
    action()
  }

  async function handleLike() {
    requireAuth(async () => {
      const updated = await toggleLike(memorialId, user!.id)
      setLikeData(updated)
      if (updated.likedByCurrentUser) {
        toast(`Un cuore per ${petName}`)
      }
    })
  }

  async function handleCandle() {
    requireAuth(async () => {
      if (candleData.litByCurrentUser) return
      const updated = await lightCandle(memorialId, user!.id)
      setCandleData(updated)
      setShowCandle(true)
      toast("La tua luce riscalda il suo ricordo")
    })
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    requireAuth(async () => {
      if (!commentText.trim()) return
      const comment = await addComment(memorialId, user!.id, commentText)
      if (comment) {
        setComments((prev) => [comment, ...prev])
        setCommentText("")
        toast("Pensiero condiviso")
      }
    })
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-8">
        {/* Decorative separator */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rosa-aurora/30" />
          <Star className="size-4 text-oro-antico" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rosa-aurora/30" />
        </div>

        {/* Like + Candle buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
              likeData.likedByCurrentUser
                ? "bg-rosa-aurora/20 ring-2 ring-rosa-aurora/30"
                : "bg-card/60 hover:bg-card/80"
            )}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                likeData.likedByCurrentUser
                  ? "fill-rosa-aurora text-rosa-aurora"
                  : "text-muted-foreground"
              )}
            />
            <span>{likeData.count}</span>
            <span className="text-muted-foreground">
              {likeData.count === 1 ? "cuore" : "cuori"}
            </span>
          </button>

          <button
            onClick={handleCandle}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
              candleData.litByCurrentUser
                ? "bg-oro-antico/20 ring-2 ring-oro-antico/30"
                : "bg-card/60 hover:bg-card/80"
            )}
          >
            <Flame
              className={cn(
                "size-5 transition-colors",
                candleData.litByCurrentUser
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
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <MessageCircle className="size-5 text-muted-foreground" />
            <h3 className="font-display text-xl font-bold">Pensieri e ricordi</h3>
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {comments.length}
              </Badge>
            )}
          </div>

          {user ? (
            <form
              onSubmit={handleComment}
              className="rounded-2xl bg-card/60 p-6 shadow-sm backdrop-blur-sm"
            >
              <div className="space-y-4">
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
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card/60 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-card/80"
            >
              <LogIn className="size-4" />
              Accedi per lasciare un pensiero
            </button>
          )}

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
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.created_at)}
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

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onAuthSuccess={() => setShowAuth(false)}
      />
    </>
  )
}
