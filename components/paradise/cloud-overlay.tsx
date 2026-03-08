"use client"

import { CLOUD_SPOTS } from "@/lib/cloud-spots"
import type { CloudSpot } from "@/lib/cloud-spots"
import type { Memorial } from "@/lib/memorials"
import { CloudShape } from "./cloud-shape"
import { MemorialMarker } from "@/components/memorial/memorial-marker"

interface MapCloudLayerProps {
  memorials?: Memorial[]
  onMarkerClick?: (memorial: Memorial) => void
  onCloudClick?: (spot: CloudSpot) => void
  selectedCloudId?: string | null
  mode: "display" | "picker"
  occupiedCloudIds?: Set<string>
}

export function MapCloudLayer({
  memorials = [],
  onMarkerClick,
  onCloudClick,
  selectedCloudId,
  mode,
  occupiedCloudIds,
}: MapCloudLayerProps) {
  const occupied = occupiedCloudIds ?? new Set(memorials.map((m) => m.cloudId))
  const memorialByCloud = new Map(memorials.map((m) => [m.cloudId, m]))

  return (
    <>
      {CLOUD_SPOTS.map((spot) => {
        const memorial = memorialByCloud.get(spot.id)
        const isOccupied = occupied.has(spot.id)
        const isSelected = selectedCloudId === spot.id

        let state: "empty" | "occupied" | "selected" | "selectable"
        if (mode === "display") {
          state = isOccupied ? "occupied" : "empty"
        } else {
          // picker mode
          if (isSelected) state = "selected"
          else if (isOccupied) state = "occupied"
          else state = "selectable"
        }

        return (
          <CloudShape
            key={spot.id}
            spot={spot}
            state={state}
            onClick={
              mode === "picker" && !isOccupied
                ? () => onCloudClick?.(spot)
                : undefined
            }
          >
            {memorial && mode === "display" && (
              <MemorialMarker
                memorial={memorial}
                size="sm"
                onClick={() => onMarkerClick?.(memorial)}
              />
            )}
          </CloudShape>
        )
      })}
    </>
  )
}

/** Decorative clouds for background pages (crea, memoriale detail) */
export function DecorativeClouds() {
  const decorativeSpots = [
    { x: 8, y: "5%", w: 260, h: 140, opacity: 0.35 },
    { x: 35, y: "2%", w: 320, h: 170, opacity: 0.25 },
    { x: 65, y: "8%", w: 280, h: 150, opacity: 0.30 },
    { x: 85, y: "3%", w: 240, h: 130, opacity: 0.20 },
    { x: 15, y: "12%", w: 200, h: 110, opacity: 0.15 },
    { x: 50, y: "15%", w: 300, h: 160, opacity: 0.18 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {decorativeSpots.map((d, i) => (
        <img
          key={i}
          src={`/clouds/${(i % 3) + 1}.png`}
          alt=""
          draggable={false}
          className="absolute select-none"
          style={{
            left: `${d.x}%`,
            top: d.y,
            width: d.w,
            height: d.h,
            opacity: d.opacity,
            objectFit: "contain",
          }}
        />
      ))}
    </div>
  )
}
