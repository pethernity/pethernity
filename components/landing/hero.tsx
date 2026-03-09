"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ChevronDown } from "lucide-react"
import { TempleIllustration } from "./temple-illustration"
import { RainbowArc } from "./rainbow-arc"
import { CloudParallax } from "./cloud-parallax"

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#A8DEF0] via-background to-[#F5EDE0] px-6 text-center">
      {/* Rainbow arc — behind everything, centered above temple */}
      <div className="pointer-events-none absolute bottom-[15%] left-1/2 z-[1] w-[700px] -translate-x-1/2 opacity-60 md:w-[900px] lg:w-[1100px]">
        <RainbowArc />
      </div>

      {/* Temple — bottom center, behind content */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-[2] w-[320px] -translate-x-1/2 animate-temple-glow opacity-50 md:w-[420px] lg:w-[500px]">
        <TempleIllustration />
      </div>

      {/* Main content — on top of temple/rainbow */}
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-rosa-aurora/30 bg-white/60 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
          <Heart className="size-4 fill-current" />
          <span>Un luogo speciale per chi ci ha amato</span>
        </div>

        <h1 className="animate-fade-up font-display text-5xl font-bold leading-[1.1] tracking-tight text-foreground [animation-delay:100ms] md:text-6xl lg:text-7xl">
          Un paradiso per chi ci ha amato
        </h1>

        <p className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted-foreground [animation-delay:200ms] md:text-xl">
          Crea un memoriale unico per il tuo compagno a quattro zampe.
          Un angolo di paradiso dove il suo ricordo vivra per sempre,
          tra nuvole soffici e arcobaleni.
        </p>

        <div className="mt-10 flex animate-fade-up flex-col items-center gap-4 [animation-delay:300ms] sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg px-10 h-14 shadow-lg">
            <Link href="/crea">Crea un memoriale</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-10 h-14 bg-white/50 backdrop-blur-sm">
            <Link href="/paradiso">Esplora il paradiso</Link>
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float">
        <div className="flex flex-col items-center gap-1 text-muted-foreground/60">
          <span className="text-xs font-medium">Scopri di piu</span>
          <ChevronDown className="size-5" />
        </div>
      </div>

      {/* Cloud parallax overlay — on top of everything, dissolves on scroll */}
      <CloudParallax />
    </section>
  )
}
