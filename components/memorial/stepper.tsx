"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepCompanion } from "./step-companion"
import { StepPhoto } from "./step-photo"
import { StepMemory } from "./step-memory"
import { saveMemorial, createMemorialId, getOccupiedCloudIds, type Memorial } from "@/lib/memorials"
import { getNextAvailableCloudId } from "@/lib/cloud-spots"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

export interface StepperData {
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string
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
  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepperData>({
    petName: "",
    petType: "dog",
    photo: "",
    phrase: "",
    birthDate: "",
    deathDate: "",
  })
  const [isComplete, setIsComplete] = useState(false)

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

  function handleCreate() {
    const cloudId = getNextAvailableCloudId(getOccupiedCloudIds())
    if (!cloudId) return
    const memorial: Memorial = {
      id: createMemorialId(),
      petName: data.petName.trim(),
      petType: data.petType,
      photo: data.photo,
      phrase: data.phrase.trim(),
      birthDate: data.birthDate || undefined,
      deathDate: data.deathDate || undefined,
      cloudId,
      createdAt: new Date().toISOString(),
    }
    saveMemorial(memorial)
    setIsComplete(true)
    setTimeout(() => {
      router.push(`/paradiso`)
    }, 2500)
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
        {step === 1 && <StepPhoto data={data} onChange={updateData} />}
        {step === 2 && <StepMemory data={data} onChange={updateData} />}
      </div>

      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
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
            disabled={!canAdvance()}
            className="h-12 px-8 text-base bg-oro-antico text-white hover:bg-oro-antico/90"
          >
            <Sparkles className="size-5" />
            Crea memoriale
          </Button>
        )}
      </div>
    </div>
  )
}
