import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-rosa-aurora/15 bg-gradient-to-b from-background to-crema-divina/30 px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-display text-2xl font-bold tracking-tight text-foreground">Pethernity</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Un paradiso digitale per i nostri compagni a quattro zampe
        </p>
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
          <span>Fatto con</span>
          <Heart className="size-3 animate-pulse fill-rosa-aurora text-rosa-aurora" />
          <span>per chi ha amato e perso un amico speciale</span>
        </div>
      </div>
    </footer>
  )
}
