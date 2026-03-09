import type { Metadata } from "next"
import { MemorialStepper } from "@/components/memorial/stepper"
import { DecorativeClouds } from "@/components/paradise/cloud-overlay"

export const metadata: Metadata = {
  title: "Crea un memoriale",
  description: "Racconta la storia del tuo compagno e dagli un posto speciale nel paradiso di Pethernity.",
}

export default function CreaPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#A8DEF0] via-background to-[#E8F6FE] pt-16">
      <DecorativeClouds />
      <div className="relative z-10">
        <MemorialStepper />
      </div>
    </div>
  )
}
