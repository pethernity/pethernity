"use client"

import { useCallback, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepperData } from "./stepper"

const MAP_WIDTH = 2000
const MAP_HEIGHT = 1200

export function StepPosition({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  const [isPanning, setIsPanning] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) return
      const rect = e.currentTarget.getBoundingClientRect()
      const scaleX = MAP_WIDTH / rect.width
      const scaleY = MAP_HEIGHT / rect.height
      const x = Math.round((e.clientX - rect.left) * scaleX)
      const y = Math.round((e.clientY - rect.top) * scaleY)
      onChange({ position: { x, y } })
    },
    [onChange, isPanning]
  )

  return (
    <div className="space-y-4">
      <p className="text-center text-base text-muted-foreground">
        Clicca sulla mappa per scegliere il posto del memoriale di{" "}
        <span className="font-medium text-foreground">{data.petName}</span>
      </p>

      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 shadow-inner">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          onPanningStart={() => setIsPanning(true)}
          onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                <Button variant="secondary" size="icon-sm" onClick={() => zoomIn()}>
                  <ZoomIn className="size-4" />
                </Button>
                <Button variant="secondary" size="icon-sm" onClick={() => zoomOut()}>
                  <ZoomOut className="size-4" />
                </Button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "400px" }}
                contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
              >
                <div
                  className="relative h-full w-full cursor-crosshair"
                  style={{
                    background: `
                      linear-gradient(180deg,
                        #87CEEB 0%,
                        #B8D4E3 30%,
                        #c5e8c5 45%,
                        #a8d5a0 60%,
                        #8bc98b 100%
                      )`,
                  }}
                  onClick={handleClick}
                >
                  {/* Decorative clouds on the mini-map */}
                  <div className="absolute top-4 left-[10%] h-12 w-32 rounded-full bg-white/50 blur-sm" />
                  <div className="absolute top-8 left-[30%] h-10 w-40 rounded-full bg-white/40 blur-sm" />
                  <div className="absolute top-2 right-[20%] h-14 w-36 rounded-full bg-white/45 blur-sm" />
                  <div className="absolute top-12 right-[40%] h-8 w-28 rounded-full bg-white/35 blur-sm" />

                  {/* Placed marker */}
                  {data.position && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-full"
                      style={{ left: data.position.x, top: data.position.y }}
                    >
                      <div className="flex flex-col items-center animate-bounce">
                        <MapPin className="size-10 text-primary fill-primary drop-shadow-lg" />
                      </div>
                      <p className="mt-1 text-center text-xs font-bold text-foreground bg-white/80 rounded px-2 py-0.5 shadow">
                        {data.petName}
                      </p>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {data.position ? (
        <p className="text-center text-sm text-oro-antico font-medium">
          Posizione scelta! Puoi cliccare di nuovo per spostarla.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Tocca o clicca sulla mappa per posizionare il memoriale
        </p>
      )}
    </div>
  )
}
