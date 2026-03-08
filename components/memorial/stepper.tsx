"use client"

import { useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepCompanion } from "./step-companion"
import { StepPhoto } from "./step-photo"
import { StepMemory } from "./step-memory"
import { saveMemorial, getOccupiedCloudIds, uploadMemorialPhoto } from "@/lib/memorials"
import { getNextAvailableCloudId } from "@/lib/cloud-spots"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"
import { toast } from "sonner"

export interface StepperData {
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string // base64 preview only
  phrase: string
  birthDate: string
  deathDate: string
}

const STEP_TITLES = [
  "Il tuo compagno",
  "Una foto",
  "Un ricordo",
]

export function MemorialStepper() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepperData>({
    petName: "",
    petType: "dog",
    photo: "",
    phrase: "",
    birthDate: "",
    deathDate: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const pendingCreateRef = useRef(false)

  const progress = ((step + 1) / 3) * 100

  function updateData(partial: Partial<StepperData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return data.petName.trim().length > 0
      case 1: return data.photo.length > 0
      case 2: return data.phrase.trim().length > 0
      default: return false
    }
  }

  async function performCreate(userId: string) {
    setIsSaving(true)
    try {
      if (!photoFile) {
        toast.error("Nessuna foto selezionata")
        setIsSaving(false)
        return
      }

      const photoUrl = await uploadMemorialPhoto(userId, photoFile)
      if (!photoUrl) {
        toast.error("Errore durante il caricamento della foto")
        setIsSaving(false)
        return
      }

      const occupied = await getOccupiedCloudIds()
      const cloudId = getNextAvailableCloudId(occupied)
      if (!cloudId) {
        toast.error("Non ci sono piu nuvole disponibili nel paradiso")
        setIsSaving(false)
        return
      }

      const memorial = await saveMemorial({
        user_id: userId,
        pet_name: data.petName.trim(),
        pet_type: data.petType,
        photo_url: photoUrl,
        phrase: data.phrase.trim(),
        birth_date: data.birthDate || null,
        death_date: data.deathDate || null,
        cloud_id: cloudId,
      })

      if (!memorial) {
        toast.error("Errore durante la creazione del memoriale")
        setIsSaving(false)
        return
      }

      setIsComplete(true)
      setTimeout(() => {
        router.push("/paradiso")
      }, 2500)
    } catch {
      toast.error("Si e verificato un errore")
      setIsSaving(false)
    }
  }

  function handleCreate() {
    if (user) {
      performCreate(user.id)
    } else {
      pendingCreateRef.current = true
      setShowAuth(true)
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false)
    setTimeout(async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser && pendingCreateRef.current) {
        pendingCreateRef.current = false
        performCreate(freshUser.id)
      }
    }, 100)
  }

  if (isComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
        <div className="animate-bounce mb-6">
          <Sparkles className="size-16 text-oro-antico" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground">
          {data.petName} e nel paradiso
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Il suo memoriale e stato creato. Ti portiamo a visitarlo...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-xl px-6 py-8">
        <div className="mb-2 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            Passo {step + 1} di 3
          </span>
        </div>
        <Progress value={progress} className="mb-8 h-2" />

        <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
          {STEP_TITLES[step]}
        </h2>

        <div className="min-h-[300px]">
          {step === 0 && <StepCompanion data={data} onChange={updateData} />}
          {step === 1 && (
            <StepPhoto
              data={data}
              onChange={updateData}
              onFileSelect={setPhotoFile}
            />
          )}
          {step === 2 && <StepMemory data={data} onChange={updateData} />}
        </div>

        <div className="mt-8 flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || isSaving}
            className="h-12 px-6 text-base"
          >
            <ArrowLeft className="size-5" />
            Indietro
          </Button>

          {step < 2 ? (
            <Button
              size="lg"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="h-12 px-6 text-base"
            >
              Avanti
              <ArrowRight className="size-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={!canAdvance() || isSaving}
              className="h-12 px-8 text-base bg-oro-antico text-white hover:bg-oro-antico/90"
            >
              {isSaving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Sparkles className="size-5" />
              )}
              {isSaving ? "Creazione..." : "Crea memoriale"}
            </Button>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}
