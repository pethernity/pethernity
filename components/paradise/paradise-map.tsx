"use client"

import { useEffect, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut, Plus, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemorialMarker } from "@/components/memorial/memorial-marker"
import { getMemorials, type Memorial } from "@/lib/memorials"
import { CloudOverlay } from "./cloud-overlay"
import { Rainbow } from "./rainbow"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Link from "next/link"

const MAP_WIDTH = 4000
const MAP_HEIGHT = 2400

export function ParadiseMap() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [selected, setSelected] = useState<Memorial | null>(null)

  useEffect(() => {
    setMemorials(getMemorials())
  }, [])

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <TransformWrapper
        initialScale={0.8}
        minScale={0.3}
        maxScale={4}
        centerOnInit
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <Button asChild variant="secondary" size="sm" className="shadow-md">
                <Link href="/">
                  <Home className="size-4" />
                  Home
                </Link>
              </Button>
            </div>

            <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => zoomIn()}>
                <ZoomIn className="size-5" />
              </Button>
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => zoomOut()}>
                <ZoomOut className="size-5" />
              </Button>
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => resetTransform()}>
                <Home className="size-5" />
              </Button>
            </div>

            {/* Create CTA */}
            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
              <Button asChild size="lg" className="h-14 px-8 text-lg shadow-xl">
                <Link href="/crea">
                  <Plus className="size-5" />
                  Crea un memoriale
                </Link>
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
              <div
                className="relative h-full w-full"
                style={{
                  background: `
                    linear-gradient(180deg,
                      #87CEEB 0%,
                      #a8d4e8 15%,
                      #B8D4E3 30%,
                      #c5e8c5 45%,
                      #a8d5a0 55%,
                      #90c990 70%,
                      #7abd7a 85%,
                      #6ab36a 100%
                    )`,
                }}
              >
                {/* Clouds */}
                <CloudOverlay />

                {/* Rainbow */}
                <Rainbow className="absolute left-[10%] top-[5%] h-[500px] w-[800px]" />
                <Rainbow className="absolute right-[5%] top-[10%] h-[400px] w-[600px] -scale-x-100" />

                {/* Decorative elements */}
                <div className="absolute top-[25%] left-[15%] h-20 w-60 rounded-full bg-white/25 blur-md" />
                <div className="absolute top-[20%] left-[50%] h-16 w-48 rounded-full bg-white/20 blur-md" />
                <div className="absolute top-[30%] right-[20%] h-24 w-72 rounded-full bg-white/30 blur-md" />

                {/* Memorial markers */}
                {memorials.map((m) => (
                  <div
                    key={m.id}
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: m.position.x, top: m.position.y }}
                  >
                    <MemorialMarker
                      memorial={m}
                      onClick={() => setSelected(m)}
                    />
                  </div>
                ))}

                {/* Empty state */}
                {memorials.length === 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="font-display text-2xl font-bold text-white/80">
                      Il paradiso attende il primo ricordo
                    </p>
                    <p className="mt-2 text-lg text-white/60">
                      Crea un memoriale per il tuo compagno
                    </p>
                  </div>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Memorial detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selected.petName}</DialogTitle>
                <DialogDescription>
                  {selected.petType === "dog" ? "Cane" : selected.petType === "cat" ? "Gatto" : "Animale"}
                  {selected.deathDate && ` — ci ha lasciato il ${new Date(selected.deathDate).toLocaleDateString("it-IT")}`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={selected.photo}
                  alt={selected.petName}
                  className="h-48 w-48 rounded-2xl object-cover shadow-lg"
                />
                <blockquote className="text-center text-base italic text-muted-foreground">
                  &ldquo;{selected.phrase}&rdquo;
                </blockquote>
                {(selected.birthDate || selected.deathDate) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {selected.birthDate && (
                      <span>Nato il {new Date(selected.birthDate).toLocaleDateString("it-IT")}</span>
                    )}
                    {selected.deathDate && (
                      <span>Scomparso il {new Date(selected.deathDate).toLocaleDateString("it-IT")}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href={`/memoriale/${selected.id}`}>Vedi memoriale completo</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
