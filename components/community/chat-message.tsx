import type { ChatMessage } from "@/lib/chat"
import { formatRelativeTime } from "@/lib/interactions"
import { cn } from "@/lib/utils"

interface ChatMessageItemProps {
  message: ChatMessage
  isOwn: boolean
}

export function ChatMessageItem({ message, isOwn }: ChatMessageItemProps) {
  const initial = (message.author_name || "A").charAt(0).toUpperCase()

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-rosa-aurora/30 text-primary"
        )}
      >
        {initial}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[75%] space-y-1", isOwn && "text-right")}>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-xs font-semibold text-foreground", isOwn && "order-2")}>
            {message.author_name}
          </span>
          <span className={cn("text-[10px] text-muted-foreground", isOwn && "order-1")}>
            {formatRelativeTime(message.created_at)}
          </span>
        </div>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
            isOwn
              ? "rounded-tr-sm bg-primary/10 text-foreground"
              : "rounded-tl-sm bg-card/80 text-foreground backdrop-blur-sm"
          )}
        >
          {message.message}
        </div>
      </div>
    </div>
  )
}
