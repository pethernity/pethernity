"use client"

import { useEffect, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MapCloudLayer } from "@/components/paradise/cloud-overlay"
import { getOccupiedCloudIds } from "@/lib/memorials"
import type { CloudSpot } from "@/lib/cloud-spots"

interface StepPositionData {
  petName: string
  cloudId: string | null
}

const MAP_WIDTH = 2000
const MAP_HEIGHT = 1200

export function StepPosition({
  data,
  onChange,
}: {
  data: StepPositionData
  onChange: (d: Partial<StepPositionData>) => void
}) {
  const [occupied, setOccupied] = useState<Set<string>>(new Set())

  useEffect(() => {
    getOccupiedCloudIds().then(setOccupied)
  }, [])

  function handleCloudClick(spot: CloudSpot) {
    onChange({ cloudId: spot.id })
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-base text-muted-foreground">
        Scegli una nuvola per{" "}
        <span className="font-medium text-foreground">{data.petName}</span>
      </p>

      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 shadow-inner">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
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
                  className="relative h-full w-full"
                  style={{
                    background: `
                      linear-gradient(180deg,
                        #6CB4E4 0%, #87CEEB 20%, #A8DEF0 45%,
                        #C5E8F7 65%, #D8F0FC 80%, #E8F6FE 100%
                      )`,
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: 4000,
                    height: 2400,
                  }}
                >
                  <MapCloudLayer
                    mode="picker"
                    onCloudClick={handleCloudClick}
                    selectedCloudId={data.cloudId}
                    occupiedCloudIds={occupied}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {data.cloudId ? (
        <p className="text-center text-sm text-oro-antico font-medium">
          Nuvola scelta! Puoi cliccare un&apos;altra nuvola per cambiare.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Scegli una nuvola per posizionare il memoriale
        </p>
      )}
    </div>
  )
}
