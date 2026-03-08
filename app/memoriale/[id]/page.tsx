"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getMemorial, type Memorial } from "@/lib/memorials"
import { Button } from "@/components/ui/button"
import { CloudOverlay } from "@/components/paradise/cloud-overlay"
import { Rainbow } from "@/components/paradise/rainbow"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Heart } from "lucide-react"

export default function MemorialePage() {
  const { id } = useParams<{ id: string }>()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const m = getMemorial(id)
    if (m) {
      setMemorial(m)
    } else {
      setNotFound(true)
    }
  }, [id])

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl font-bold">Memoriale non trovato</h1>
        <p className="mt-4 text-muted-foreground">
          Questo memoriale potrebbe essere stato rimosso o il link non e corretto.
        </p>
        <Button asChild className="mt-8">
          <Link href="/paradiso">Vai al paradiso</Link>
        </Button>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-celeste-paradiso/20 via-background to-rosa-aurora/15">
      <CloudOverlay />
      <Rainbow className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[600px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/paradiso">
            <ArrowLeft className="size-4" />
            Torna al paradiso
          </Link>
        </Button>

        <div className="mt-8 flex flex-col items-center text-center">
          {/* Photo */}
          <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-rosa-aurora/20">
            <img
              src={memorial.photo}
              alt={memorial.petName}
              className="h-72 w-72 object-cover"
            />
          </div>

          {/* Name */}
          <h1 className="mt-8 font-display text-4xl font-bold text-foreground md:text-5xl">
            {memorial.petName}
          </h1>

          {/* Type badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rosa-aurora/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="size-4 fill-current" />
            {memorial.petType === "dog" ? "Cane" : memorial.petType === "cat" ? "Gatto" : "Animale"}
          </div>

          {/* Dates */}
          {(memorial.birthDate || memorial.deathDate) && (
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-muted-foreground">
              {memorial.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Nato il {new Date(memorial.birthDate).toLocaleDateString("it-IT")}</span>
                </div>
              )}
              {memorial.deathDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Scomparso il {new Date(memorial.deathDate).toLocaleDateString("it-IT")}</span>
                </div>
              )}
            </div>
          )}

          {/* Memory phrase */}
          <blockquote className="mt-10 max-w-lg rounded-2xl bg-card/60 p-8 text-center text-xl italic leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
            &ldquo;{memorial.phrase}&rdquo;
          </blockquote>

          {/* Map link */}
          <div className="mt-10">
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/paradiso">
                <MapPin className="size-5" />
                Visita nel paradiso
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
