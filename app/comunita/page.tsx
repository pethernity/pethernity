import type { Metadata } from "next"
import { DecorativeClouds } from "@/components/paradise/cloud-overlay"
import { ChatBoard } from "@/components/community/chat-board"
import { Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Comunita",
  description: "Uno spazio di conforto per chi ha perso un compagno a quattro zampe. Condividi pensieri e ricordi.",
}

export default function ComunitaPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#A8DEF0] via-background to-[#E8F6FE] pt-16">
      <DecorativeClouds />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rosa-aurora/30 bg-white/60 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
            <Heart className="size-4 fill-current" />
            <span>Un luogo di conforto</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Comunita
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Uno spazio per condividere ricordi, dare conforto e sentirsi meno soli nel ricordo di chi ci ha amato.
          </p>
        </div>

        <ChatBoard />
      </div>
    </div>
  )
}
