import type { Metadata } from "next"
import { MemorialStepper } from "@/components/memorial/stepper"
import { DecorativeClouds } from "@/components/paradise/cloud-overlay"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Crea un memoriale",
  description: "Racconta la storia del tuo compagno e dagli un posto speciale nel paradiso di Pethernity.",
}

export default function CreaPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#A8DEF0] via-background to-[#E8F6FE]">
      <DecorativeClouds />
      <div className="relative z-10">
        <div className="px-6 pt-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Torna alla home
            </Link>
          </Button>
        </div>
        <MemorialStepper />
      </div>
    </div>
  )
}
