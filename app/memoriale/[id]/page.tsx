"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getMemorial, deleteMemorial, type Memorial } from "@/lib/memorials"
import { Button } from "@/components/ui/button"
import { DecorativeClouds } from "@/components/paradise/cloud-overlay"
import { Rainbow } from "@/components/paradise/rainbow"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Heart, Trash2 } from "lucide-react"
import { MemorialInteractions } from "@/components/memorial/memorial-interactions"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MemorialePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const m = await getMemorial(id)
      if (m) {
        setMemorial(m)
      } else {
        setNotFound(true)
      }
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!memorial) return
    const success = await deleteMemorial(memorial.id)
    if (success) {
      toast.success("Memoriale eliminato")
      router.push("/paradiso")
    } else {
      toast.error("Errore durante l'eliminazione")
    }
  }

  const isOwner = user && memorial && user.id === memorial.user_id

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
    <div className="relative min-h-svh bg-gradient-to-b from-[#A8DEF0] via-background to-[#E8F6FE] pt-16">
      <DecorativeClouds />
      <Rainbow className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[600px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/paradiso">
              <ArrowLeft className="size-4" />
              Torna al paradiso
            </Link>
          </Button>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  Elimina
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare il memoriale?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non puo essere annullata. Il memoriale di {memorial.pet_name} verra rimosso per sempre.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,400px] lg:gap-14">
          <div className="flex flex-col items-center text-center">
            <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-rosa-aurora/20">
              <img
                src={memorial.photo_url}
                alt={memorial.pet_name}
                className="h-72 w-72 object-cover"
              />
            </div>

            <h1 className="mt-8 font-display text-4xl font-bold text-foreground md:text-5xl">
              {memorial.pet_name}
            </h1>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rosa-aurora/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Heart className="size-4 fill-current" />
              {memorial.pet_type === "dog" ? "Cane" : memorial.pet_type === "cat" ? "Gatto" : "Animale"}
            </div>

            {(memorial.birth_date || memorial.death_date) && (
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-muted-foreground">
                {memorial.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Nato il {new Date(memorial.birth_date).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
                {memorial.death_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Scomparso il {new Date(memorial.death_date).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
              </div>
            )}

            <blockquote className="mt-10 max-w-lg rounded-2xl bg-card/60 p-8 text-center text-xl italic leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
              &ldquo;{memorial.phrase}&rdquo;
            </blockquote>

            <div className="mt-10">
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/paradiso">
                  <MapPin className="size-5" />
                  Visita nel paradiso
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <MemorialInteractions memorialId={memorial.id} petName={memorial.pet_name} />
          </div>
        </div>
      </div>
    </div>
  )
}
