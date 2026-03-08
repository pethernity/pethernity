"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut, Home, Heart, Star, Calendar, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMemorials, type Memorial } from "@/lib/memorials"
import { getInteractionCounts, type InteractionCounts } from "@/lib/interactions"
import { MapCloudLayer } from "./cloud-overlay"
import { Rainbow } from "./rainbow"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import Link from "next/link"
import { UserMenu } from "@/components/auth/user-menu"

function InteractionBadges({ memorialId }: { memorialId: string }) {
  const [counts, setCounts] = useState<InteractionCounts | null>(null)
  useEffect(() => { getInteractionCounts(memorialId).then(setCounts) }, [memorialId])

  if (!counts || (counts.likes + counts.candles + counts.comments === 0)) return null

  return (
    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
      {counts.likes > 0 && <span>❤️ {counts.likes}</span>}
      {counts.candles > 0 && <span>🕯️ {counts.candles}</span>}
      {counts.comments > 0 && <span>💬 {counts.comments}</span>}
    </div>
  )
}

const MAP_WIDTH = 4000
const MAP_HEIGHT = 2400

export function ParadiseMap() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [selected, setSelected] = useState<Memorial | null>(null)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMemorials().then(setMemorials)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = query.trim()
    ? memorials.filter(m =>
        m.pet_name.toLowerCase().includes(query.toLowerCase()) ||
        m.phrase.toLowerCase().includes(query.toLowerCase())
      )
    : memorials

  return (
    <div
      className="relative h-svh w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #8EC5E2 0%, #B8D4E3 30%, #D8F0FC 60%, #F0E8DE 85%, #E8D0D8 100%)",
      }}
    >
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

              {/* Search bar */}
              <div ref={searchRef} className="relative">
                <div className="flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-sm shadow-md pl-3 pr-1 border border-rosa-aurora/20">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cerca un memoriale..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
                    onFocus={() => setSearchOpen(true)}
                    className="h-9 w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  {query && (
                    <button
                      onClick={() => { setQuery(""); setSearchOpen(false) }}
                      className="flex size-7 items-center justify-center rounded-lg hover:bg-rosa-aurora/10 transition-colors"
                    >
                      <X className="size-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {searchOpen && query.trim() && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-rosa-aurora/20 overflow-hidden">
                    {filtered.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">Nessun memoriale trovato</p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto py-1">
                        {filtered.map(m => (
                          <li key={m.id}>
                            <button
                              onClick={() => { setSelected(m); setSearchOpen(false) }}
                              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-rosa-aurora/10 transition-colors"
                            >
                              <img src={m.photo_url} className="size-9 rounded-full object-cover ring-2 ring-white" alt={m.pet_name} />
                              <div className="text-left">
                                <p className="text-sm font-medium">{m.pet_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {m.pet_type === "dog" ? "Cane" : m.pet_type === "cat" ? "Gatto" : "Animale"}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
              <UserMenu />
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


            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
              <div className="relative h-full w-full">
                {/* Rainbows */}
                <Rainbow className="absolute left-[10%] top-[5%] h-[500px] w-[800px]" />
                <Rainbow className="absolute right-[5%] top-[10%] h-[400px] w-[600px] -scale-x-100" />

                {/* Clouds with memorial markers */}
                <MapCloudLayer
                  memorials={filtered}
                  mode="display"
                  onMarkerClick={setSelected}
                />

                {/* Empty state */}
                {memorials.length === 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="font-display text-2xl font-bold text-white/80">
                      Il paradiso attende il primo ricordo
                    </p>
                    <p className="mt-2 text-lg text-white/60">
                      Scegli una nuvola per il tuo compagno
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
        <DialogContent className="sm:max-w-[420px] p-0 border-none shadow-2xl ring-1 ring-rosa-aurora/20 animate-soft-glow bg-gradient-to-b from-[#F5EDE0] via-white to-[#E8F6FE] overflow-hidden">
          {selected && (
            <div className="flex flex-col items-center">
              {/* Rainbow bar */}
              <div
                className="h-2 w-full"
                style={{
                  background: "linear-gradient(90deg, #C4A8D4, #F5C7A0, #F2DC8A, #A8D5B0, #8EC5E2)",
                }}
              />

              <div className="flex flex-col items-center gap-5 px-6 pt-6 pb-6">
                {/* Photo with glow */}
                <div className="relative">
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-rosa-aurora/20 via-celeste-paradiso/20 to-oro-antico/20 blur-xl" />
                  <img
                    src={selected.photo_url}
                    alt={selected.pet_name}
                    className="relative h-52 w-52 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                </div>

                {/* Name & type */}
                <div className="text-center">
                  <h2 className="font-display text-3xl font-bold text-foreground">{selected.pet_name}</h2>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <Heart className="size-3.5 fill-rosa-aurora text-rosa-aurora" />
                    {selected.pet_type === "dog" ? "Cane" : selected.pet_type === "cat" ? "Gatto" : "Animale"}
                  </p>
                </div>

                {/* Decorative separator */}
                <div className="flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rosa-aurora/30" />
                  <Star className="size-4 text-oro-antico" />
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rosa-aurora/30" />
                </div>

                {/* Quote */}
                <blockquote className="w-full rounded-xl bg-crema-divina/50 p-4 text-center text-base italic leading-relaxed text-muted-foreground shadow-inner backdrop-blur-sm">
                  &ldquo;{selected.phrase}&rdquo;
                </blockquote>

                {/* Dates */}
                {(selected.birth_date || selected.death_date) && (
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                    {selected.birth_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Nato il {new Date(selected.birth_date).toLocaleDateString("it-IT")}
                      </span>
                    )}
                    {selected.death_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Scomparso il {new Date(selected.death_date).toLocaleDateString("it-IT")}
                      </span>
                    )}
                  </div>
                )}

                {/* Interaction counts */}
                <InteractionBadges memorialId={selected.id} />

                {/* CTA */}
                <Button asChild className="shadow-md">
                  <Link href={`/memoriale/${selected.id}`}>
                    <Heart className="size-4" />
                    Vedi memoriale completo
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
