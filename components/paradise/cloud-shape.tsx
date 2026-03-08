import { cn } from "@/lib/utils"
import type { CloudSpot } from "@/lib/cloud-spots"

type CloudState = "empty" | "occupied" | "selected" | "selectable"

interface CloudShapeProps {
  spot: CloudSpot
  state: CloudState
  onClick?: () => void
  children?: React.ReactNode
}

export function CloudShape({ spot, state, onClick, children }: CloudShapeProps) {
  const isInteractive = state === "selectable" || state === "selected"

  return (
    <div
      className="absolute"
      style={{
        left: spot.x - spot.width / 2,
        top: spot.y - spot.height / 2,
        width: spot.width,
        height: spot.height,
      }}
    >
      <div
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={isInteractive ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.() } : undefined}
        className={cn(
          "relative transition-all duration-200",
          state === "empty" && "opacity-70",
          state === "occupied" && "opacity-95",
          state === "selectable" && "opacity-80 cursor-pointer hover:opacity-100 hover:scale-105",
          state === "selected" && "opacity-100",
        )}
      >
        <img
          src={`/clouds/${spot.variant}.png`}
          alt=""
          draggable={false}
          className="block h-full w-full object-contain pointer-events-none select-none"
          style={{ width: spot.width, height: spot.height }}
        />

        {/* Selection ring */}
        {state === "selected" && (
          <div
            className="absolute animate-pulse-ring rounded-full border-2 border-oro-antico"
            style={{
              left: spot.width * 0.1,
              top: spot.height * 0.1,
              width: spot.width * 0.8,
              height: spot.height * 0.8,
            }}
          />
        )}
      </div>

      {/* Children (memorial marker) positioned on top-center of cloud */}
      {children && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: -10 }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
