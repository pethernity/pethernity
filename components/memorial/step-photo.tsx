"use client"

import { useCallback, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepperData } from "./stepper"

export function StepPhoto({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = () => {
        onChange({ photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (data.photo) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img
            src={data.photo}
            alt="Foto del tuo compagno"
            className="h-64 w-64 rounded-2xl object-cover shadow-lg"
          />
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute -right-2 -top-2 rounded-full"
            onClick={() => onChange({ photo: "" })}
          >
            <X className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Una foto bellissima!</p>
      </div>
    )
  }

  return (
    <div
      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-muted/30 p-12 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <ImagePlus className="mb-4 size-16 text-muted-foreground" />
      <p className="text-lg font-medium text-foreground">
        Trascina qui una foto
      </p>
      <p className="mt-2 text-base text-muted-foreground">
        oppure clicca per sceglierla dal tuo dispositivo
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
