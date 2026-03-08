import { Card, CardContent } from "@/components/ui/card"
import { PenLine, MapPin, Heart } from "lucide-react"

const steps = [
  {
    icon: PenLine,
    title: "Racconta",
    description: "Dicci il nome del tuo compagno, condividi una foto e scrivi un ricordo speciale.",
  },
  {
    icon: MapPin,
    title: "Posiziona",
    description: "Scegli il suo posto nel paradiso, tra prati verdi, nuvole e arcobaleni.",
  },
  {
    icon: Heart,
    title: "Ricorda",
    description: "Visita il suo memoriale quando vuoi. Il suo ricordo restera per sempre.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="font-display text-center text-3xl font-bold text-foreground md:text-4xl">
        Come funziona
      </h2>
      <p className="mt-4 text-center text-lg text-muted-foreground">
        Tre semplici passi per creare un ricordo eterno
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title} className="relative border-none bg-gradient-to-b from-card to-background shadow-md">
            <CardContent className="flex flex-col items-center text-center pt-8">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-rosa-aurora/20">
                <step.icon className="size-8 text-primary" />
              </div>
              <span className="mb-2 text-sm font-medium text-oro-antico">Passo {i + 1}</span>
              <h3 className="font-display text-2xl font-bold text-foreground">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
