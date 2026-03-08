import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dog, Cat, Rabbit } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StepperData } from "./stepper"

const petTypes = [
  { value: "dog" as const, label: "Cane", icon: Dog },
  { value: "cat" as const, label: "Gatto", icon: Cat },
  { value: "other" as const, label: "Altro", icon: Rabbit },
]

export function StepCompanion({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="petName" className="text-base font-medium">
          Come si chiamava il tuo compagno?
        </Label>
        <Input
          id="petName"
          placeholder="Il suo nome..."
          value={data.petName}
          onChange={(e) => onChange({ petName: e.target.value })}
          className="h-12 text-lg"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Che tipo di animale era?</Label>
        <div className="grid grid-cols-3 gap-4">
          {petTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ petType: value })}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                data.petType === value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <Icon className={cn("size-10", data.petType === value ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-base font-medium", data.petType === value ? "text-primary" : "text-muted-foreground")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
