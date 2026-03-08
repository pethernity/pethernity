import { cn } from "@/lib/utils"
import type { Memorial } from "@/lib/memorials"

export function MemorialMarker({
  memorial,
  onClick,
  size = "default",
  className,
}: {
  memorial: Memorial
  onClick?: () => void
  size?: "default" | "sm"
  className?: string
}) {
  const isSmall = size === "sm"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center transition-transform hover:scale-105 animate-float drop-shadow-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Photo circle */}
      <div
        className={cn(
          "overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all",
          isSmall ? "size-12" : "size-16"
        )}
      >
        <img
          src={memorial.photo_url}
          alt={memorial.pet_name}
          className="size-full object-cover"
        />
      </div>

      {/* Tombstone body */}
      <div
        className={cn(
          "-mt-2 flex flex-col items-center rounded-xl bg-white/90 shadow-md backdrop-blur-sm border border-rosa-aurora/30",
          isSmall ? "px-3 py-2 pt-4" : "px-4 py-3 pt-5"
        )}
      >
        <p className={cn("font-display font-bold text-foreground", isSmall ? "text-xs" : "text-sm")}>
          {memorial.pet_name}
        </p>
        {!isSmall && memorial.phrase && (
          <p className="mt-1 max-w-[140px] text-center text-xs text-muted-foreground line-clamp-2">
            {memorial.phrase}
          </p>
        )}
      </div>

    </button>
  )
}
