import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card/50 px-6 py-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-display text-xl font-bold text-foreground">Pethernity</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Un paradiso digitale per i nostri compagni a quattro zampe
        </p>
        <div className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>Fatto con</span>
          <Heart className="size-3 fill-primary text-primary" />
          <span>per chi ha amato e perso un amico speciale</span>
        </div>
      </div>
    </footer>
  )
}
