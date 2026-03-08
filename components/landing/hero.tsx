import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CloudOverlay } from "@/components/paradise/cloud-overlay"
import { Rainbow } from "@/components/paradise/rainbow"
import { Heart } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-celeste-paradiso/30 via-background to-rosa-aurora/20 px-6 text-center">
      <CloudOverlay />
      <Rainbow className="pointer-events-none absolute -right-20 -top-10 h-[400px] w-[600px] rotate-12 opacity-40" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-rosa-aurora/20 px-4 py-2 text-sm text-primary">
          <Heart className="size-4 fill-current" />
          <span>Un luogo speciale per chi ci ha amato</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Un paradiso per chi ci ha amato
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Crea un memoriale unico per il tuo compagno a quattro zampe.
          Un angolo di paradiso dove il suo ricordo vivra per sempre,
          tra nuvole soffici e arcobaleni.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg px-10 h-14">
            <Link href="/crea">Crea un memoriale</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14">
            <Link href="/paradiso">Esplora il paradiso</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
