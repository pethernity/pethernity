import { Card, CardContent } from "@/components/ui/card"
import { PenLine, Cloud, Heart } from "lucide-react"

const steps = [
  {
    icon: PenLine,
    title: "Racconta",
    description: "Dicci il nome del tuo compagno, condividi una foto e scrivi un ricordo speciale.",
  },
  {
    icon: Cloud,
    title: "Affida",
    description: "Il tuo compagno trovera la sua nuvola nel paradiso, un angolo unico tra arcobaleni e cielo.",
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
      <h2 className="font-display text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Come funziona
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-lg text-muted-foreground">
        Tre semplici passi per creare un ricordo eterno
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title} className="group relative border border-rosa-aurora/10 bg-gradient-to-b from-white to-crema-divina/30 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="flex flex-col items-center text-center pt-8">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-rosa-aurora/20 to-celeste-paradiso/20 shadow-sm ring-1 ring-rosa-aurora/10 transition-transform duration-300 group-hover:scale-110">
                <step.icon className="size-8 text-primary" />
              </div>
              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-oro-antico">Passo {i + 1}</span>
              <h3 className="font-display text-xl font-bold text-foreground">{step.title}</h3>
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
