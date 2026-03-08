import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StepperData } from "./stepper"

export function StepMemory({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="phrase" className="text-base font-medium">
          Scrivi un ricordo o un pensiero per il tuo compagno
        </Label>
        <Textarea
          id="phrase"
          placeholder="Il ricordo piu bello, una frase che lo descrive, qualcosa che vorresti dirgli..."
          value={data.phrase}
          onChange={(e) => onChange({ phrase: e.target.value })}
          className="min-h-32 text-base"
          autoFocus
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="birthDate" className="text-base font-medium">
            Data di nascita <span className="text-muted-foreground">(opzionale)</span>
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="deathDate" className="text-base font-medium">
            Data di scomparsa <span className="text-muted-foreground">(opzionale)</span>
          </Label>
          <Input
            id="deathDate"
            type="date"
            value={data.deathDate}
            onChange={(e) => onChange({ deathDate: e.target.value })}
            className="h-12 text-base"
          />
        </div>
      </div>
    </div>
  )
}
