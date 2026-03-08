# Pethernity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pet memorial web app with a landing page, 4-step creation stepper, and a paradise-themed infinite-pan map.

**Architecture:** Next.js 16 App Router with 4 routes (`/`, `/crea`, `/paradiso`, `/memoriale/[id]`). Data in localStorage. Paradise map uses react-zoom-pan-pinch for infinite pan/zoom. All UI uses existing shadcn/ui components + custom Tailwind.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (radix-ui), react-zoom-pan-pinch, Lucide icons, localStorage.

---

### Task 1: Install dependency and create data layer

**Files:**
- Create: `lib/memorials.ts`

**Step 1: Install react-zoom-pan-pinch**

Run: `pnpm add react-zoom-pan-pinch`
Expected: Package added to dependencies in package.json

**Step 2: Create the memorial data types and localStorage helpers**

Create `lib/memorials.ts`:

```typescript
export interface Memorial {
  id: string
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string
  phrase: string
  birthDate?: string
  deathDate?: string
  position: { x: number; y: number }
  createdAt: string
}

const STORAGE_KEY = "pethernity-memorials"

export function getMemorials(): Memorial[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Memorial[]
  } catch {
    return []
  }
}

export function getMemorial(id: string): Memorial | undefined {
  return getMemorials().find((m) => m.id === id)
}

export function saveMemorial(memorial: Memorial): void {
  const memorials = getMemorials()
  memorials.push(memorial)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memorials))
}

export function createMemorialId(): string {
  return crypto.randomUUID()
}
```

**Step 3: Commit**

```bash
git add lib/memorials.ts package.json pnpm-lock.yaml
git commit -m "feat: add memorial data layer and install react-zoom-pan-pinch"
```

---

### Task 2: Build animated cloud and rainbow decorative components

**Files:**
- Create: `components/paradise/cloud-overlay.tsx`
- Create: `components/paradise/rainbow.tsx`

**Step 1: Create cloud overlay component**

Create `components/paradise/cloud-overlay.tsx`:

```tsx
export function CloudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Layer 1 — large slow clouds */}
      <div className="animate-cloud-drift-slow absolute -top-10 left-0 h-40 w-full opacity-40">
        <svg viewBox="0 0 1200 200" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="200" cy="100" rx="180" ry="70" fill="white" />
          <ellipse cx="350" cy="80" rx="140" ry="60" fill="white" />
          <ellipse cx="280" cy="110" rx="160" ry="50" fill="white" />
          <ellipse cx="700" cy="90" rx="200" ry="80" fill="white" />
          <ellipse cx="850" cy="70" rx="150" ry="60" fill="white" />
          <ellipse cx="780" cy="100" rx="170" ry="55" fill="white" />
          <ellipse cx="1100" cy="95" rx="160" ry="65" fill="white" />
        </svg>
      </div>
      {/* Layer 2 — medium clouds */}
      <div className="animate-cloud-drift-medium absolute top-20 left-0 h-32 w-full opacity-25">
        <svg viewBox="0 0 1200 160" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="100" cy="80" rx="120" ry="50" fill="white" />
          <ellipse cx="500" cy="70" rx="160" ry="60" fill="white" />
          <ellipse cx="620" cy="90" rx="130" ry="45" fill="white" />
          <ellipse cx="950" cy="75" rx="140" ry="55" fill="white" />
        </svg>
      </div>
      {/* Layer 3 — small fast wisps */}
      <div className="animate-cloud-drift-fast absolute bottom-10 left-0 h-24 w-full opacity-15">
        <svg viewBox="0 0 1200 120" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="300" cy="60" rx="100" ry="35" fill="white" />
          <ellipse cx="800" cy="50" rx="80" ry="30" fill="white" />
        </svg>
      </div>
    </div>
  )
}
```

**Step 2: Create rainbow component**

Create `components/paradise/rainbow.tsx`:

```tsx
export function Rainbow({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 600 300" className="h-full w-full opacity-30">
        <defs>
          <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--rainbow-azzurro)" />
            <stop offset="25%" stopColor="var(--rainbow-verde)" />
            <stop offset="50%" stopColor="var(--rainbow-giallo)" />
            <stop offset="75%" stopColor="var(--rainbow-pesca)" />
            <stop offset="100%" stopColor="var(--rainbow-lavanda)" />
          </linearGradient>
        </defs>
        <path
          d="M 50 280 Q 300 -50 550 280"
          stroke="url(#rainbow-grad)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 70 280 Q 300 -20 530 280"
          stroke="url(#rainbow-grad)"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}
```

**Step 3: Add cloud animation keyframes to globals.css**

Append to `app/globals.css` inside `@layer base {}` or after it:

```css
@keyframes cloud-drift-slow {
  0% { transform: translateX(-10%); }
  100% { transform: translateX(10%); }
}
@keyframes cloud-drift-medium {
  0% { transform: translateX(5%); }
  100% { transform: translateX(-15%); }
}
@keyframes cloud-drift-fast {
  0% { transform: translateX(-5%); }
  100% { transform: translateX(15%); }
}

@theme inline {
  --animate-cloud-drift-slow: cloud-drift-slow 30s ease-in-out infinite alternate;
  --animate-cloud-drift-medium: cloud-drift-medium 22s ease-in-out infinite alternate;
  --animate-cloud-drift-fast: cloud-drift-fast 16s ease-in-out infinite alternate;
}
```

**Step 4: Commit**

```bash
git add components/paradise/ app/globals.css
git commit -m "feat: add animated cloud overlay and rainbow decorative components"
```

---

### Task 3: Build Landing Page

**Files:**
- Create: `components/landing/hero.tsx`
- Create: `components/landing/how-it-works.tsx`
- Create: `components/landing/footer.tsx`
- Modify: `app/page.tsx`

**Step 1: Create Hero section**

Create `components/landing/hero.tsx`:

```tsx
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
```

**Step 2: Create How It Works section**

Create `components/landing/how-it-works.tsx`:

```tsx
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
```

**Step 3: Create Footer**

Create `components/landing/footer.tsx`:

```tsx
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
```

**Step 4: Update app/page.tsx to assemble landing page**

Replace `app/page.tsx` with:

```tsx
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Footer } from "@/components/landing/footer"

export default function Page() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Footer />
    </main>
  )
}
```

**Step 5: Run dev server to verify**

Run: `pnpm dev`
Expected: Landing page renders with hero, how-it-works cards, and footer. Clouds animate. No errors.

**Step 6: Commit**

```bash
git add components/landing/ app/page.tsx
git commit -m "feat: build landing page with hero, how-it-works, and footer"
```

---

### Task 4: Build Memorial Stepper — Steps 1-3

**Files:**
- Create: `app/crea/page.tsx`
- Create: `components/memorial/stepper.tsx`
- Create: `components/memorial/step-companion.tsx`
- Create: `components/memorial/step-photo.tsx`
- Create: `components/memorial/step-memory.tsx`

**Step 1: Create stepper container with state management**

Create `components/memorial/stepper.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepCompanion } from "./step-companion"
import { StepPhoto } from "./step-photo"
import { StepMemory } from "./step-memory"
import { StepPosition } from "./step-position"
import { saveMemorial, createMemorialId, type Memorial } from "@/lib/memorials"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

export interface StepperData {
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string
  phrase: string
  birthDate: string
  deathDate: string
  position: { x: number; y: number } | null
}

const STEP_TITLES = [
  "Il tuo compagno",
  "Una foto",
  "Un ricordo",
  "Il suo posto in paradiso",
]

export function MemorialStepper() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepperData>({
    petName: "",
    petType: "dog",
    photo: "",
    phrase: "",
    birthDate: "",
    deathDate: "",
    position: null,
  })
  const [isComplete, setIsComplete] = useState(false)

  const progress = ((step + 1) / 4) * 100

  function updateData(partial: Partial<StepperData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return data.petName.trim().length > 0
      case 1: return data.photo.length > 0
      case 2: return data.phrase.trim().length > 0
      case 3: return data.position !== null
      default: return false
    }
  }

  function handleCreate() {
    if (!data.position) return
    const memorial: Memorial = {
      id: createMemorialId(),
      petName: data.petName.trim(),
      petType: data.petType,
      photo: data.photo,
      phrase: data.phrase.trim(),
      birthDate: data.birthDate || undefined,
      deathDate: data.deathDate || undefined,
      position: data.position,
      createdAt: new Date().toISOString(),
    }
    saveMemorial(memorial)
    setIsComplete(true)
    setTimeout(() => {
      router.push(`/paradiso`)
    }, 2500)
  }

  if (isComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
        <div className="animate-bounce mb-6">
          <Sparkles className="size-16 text-oro-antico" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground">
          {data.petName} e nel paradiso
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Il suo memoriale e stato creato. Ti portiamo a visitarlo...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      {/* Progress */}
      <div className="mb-2 text-center">
        <span className="text-sm font-medium text-muted-foreground">
          Passo {step + 1} di 4
        </span>
      </div>
      <Progress value={progress} className="mb-8 h-2" />

      {/* Step title */}
      <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
        {STEP_TITLES[step]}
      </h2>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 0 && <StepCompanion data={data} onChange={updateData} />}
        {step === 1 && <StepPhoto data={data} onChange={updateData} />}
        {step === 2 && <StepMemory data={data} onChange={updateData} />}
        {step === 3 && <StepPosition data={data} onChange={updateData} />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="h-12 px-6 text-base"
        >
          <ArrowLeft className="size-5" />
          Indietro
        </Button>

        {step < 3 ? (
          <Button
            size="lg"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="h-12 px-6 text-base"
          >
            Avanti
            <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={!canAdvance()}
            className="h-12 px-8 text-base bg-oro-antico text-white hover:bg-oro-antico/90"
          >
            <Sparkles className="size-5" />
            Crea memoriale
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create Step 1 — Companion info**

Create `components/memorial/step-companion.tsx`:

```tsx
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
```

**Step 3: Create Step 2 — Photo upload**

Create `components/memorial/step-photo.tsx`:

```tsx
"use client"

import { useCallback, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepperData } from "./stepper"

export function StepPhoto({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = () => {
        onChange({ photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (data.photo) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img
            src={data.photo}
            alt="Foto del tuo compagno"
            className="h-64 w-64 rounded-2xl object-cover shadow-lg"
          />
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute -right-2 -top-2 rounded-full"
            onClick={() => onChange({ photo: "" })}
          >
            <X className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Una foto bellissima!</p>
      </div>
    )
  }

  return (
    <div
      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-muted/30 p-12 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <ImagePlus className="mb-4 size-16 text-muted-foreground" />
      <p className="text-lg font-medium text-foreground">
        Trascina qui una foto
      </p>
      <p className="mt-2 text-base text-muted-foreground">
        oppure clicca per sceglierla dal tuo dispositivo
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
```

**Step 4: Create Step 3 — Memory phrase + dates**

Create `components/memorial/step-memory.tsx`:

```tsx
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
```

**Step 5: Create the /crea page**

Create `app/crea/page.tsx`:

```tsx
import { MemorialStepper } from "@/components/memorial/stepper"
import { CloudOverlay } from "@/components/paradise/cloud-overlay"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreaPage() {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-celeste-paradiso/10 via-background to-rosa-aurora/10">
      <CloudOverlay />
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
```

**Step 6: Run dev and verify steps 1-3**

Run: `pnpm dev`
Navigate to `/crea`. Verify:
- Progress bar advances
- Step 1: name input, animal type buttons work
- Step 2: drag & drop and click upload work, preview shows
- Step 3: textarea and date inputs work
- Back/Next navigation works, Next disabled when required fields empty

**Step 7: Commit**

```bash
git add app/crea/ components/memorial/stepper.tsx components/memorial/step-companion.tsx components/memorial/step-photo.tsx components/memorial/step-memory.tsx
git commit -m "feat: build memorial creation stepper with steps 1-3"
```

---

### Task 5: Build Memorial Marker component

**Files:**
- Create: `components/memorial/memorial-marker.tsx`

**Step 1: Create the tombstone marker**

Create `components/memorial/memorial-marker.tsx`:

```tsx
import { cn } from "@/lib/utils"
import type { Memorial } from "@/lib/memorials"

export function MemorialMarker({
  memorial,
  onClick,
  size = "default",
  className,
}: {
  memorial: Memorial
  onClick?: () => void
  size?: "default" | "sm"
  className?: string
}) {
  const isSmall = size === "sm"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center transition-transform hover:scale-105",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Photo circle */}
      <div
        className={cn(
          "overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all",
          isSmall ? "size-12" : "size-16"
        )}
      >
        <img
          src={memorial.photo}
          alt={memorial.petName}
          className="size-full object-cover"
        />
      </div>

      {/* Tombstone body */}
      <div
        className={cn(
          "-mt-2 flex flex-col items-center rounded-xl bg-white/90 shadow-md backdrop-blur-sm border border-rosa-aurora/30",
          isSmall ? "px-3 py-2 pt-4" : "px-4 py-3 pt-5"
        )}
      >
        <p className={cn("font-display font-bold text-foreground", isSmall ? "text-xs" : "text-sm")}>
          {memorial.petName}
        </p>
        {!isSmall && memorial.phrase && (
          <p className="mt-1 max-w-[140px] text-center text-xs text-muted-foreground line-clamp-2">
            {memorial.phrase}
          </p>
        )}
      </div>

      {/* Ground stake */}
      <div className={cn("bg-gradient-to-b from-oro-antico/60 to-oro-antico/20 rounded-full", isSmall ? "h-3 w-1" : "h-4 w-1.5")} />
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add components/memorial/memorial-marker.tsx
git commit -m "feat: add memorial tombstone marker component"
```

---

### Task 6: Build Step 4 — Position picker (mini map)

**Files:**
- Create: `components/memorial/step-position.tsx`

**Step 1: Create position picker with mini paradise map**

Create `components/memorial/step-position.tsx`:

```tsx
"use client"

import { useCallback, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepperData } from "./stepper"

const MAP_WIDTH = 2000
const MAP_HEIGHT = 1200

export function StepPosition({
  data,
  onChange,
}: {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
}) {
  const [isPanning, setIsPanning] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) return
      const rect = e.currentTarget.getBoundingClientRect()
      const scaleX = MAP_WIDTH / rect.width
      const scaleY = MAP_HEIGHT / rect.height
      const x = Math.round((e.clientX - rect.left) * scaleX)
      const y = Math.round((e.clientY - rect.top) * scaleY)
      onChange({ position: { x, y } })
    },
    [onChange, isPanning]
  )

  return (
    <div className="space-y-4">
      <p className="text-center text-base text-muted-foreground">
        Clicca sulla mappa per scegliere il posto del memoriale di{" "}
        <span className="font-medium text-foreground">{data.petName}</span>
      </p>

      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 shadow-inner">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          onPanningStart={() => setIsPanning(true)}
          onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                <Button variant="secondary" size="icon-sm" onClick={() => zoomIn()}>
                  <ZoomIn className="size-4" />
                </Button>
                <Button variant="secondary" size="icon-sm" onClick={() => zoomOut()}>
                  <ZoomOut className="size-4" />
                </Button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "400px" }}
                contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
              >
                <div
                  className="relative h-full w-full cursor-crosshair"
                  style={{
                    background: `
                      linear-gradient(180deg,
                        #87CEEB 0%,
                        #B8D4E3 30%,
                        #c5e8c5 45%,
                        #a8d5a0 60%,
                        #8bc98b 100%
                      )`,
                  }}
                  onClick={handleClick}
                >
                  {/* Decorative clouds on the mini-map */}
                  <div className="absolute top-4 left-[10%] h-12 w-32 rounded-full bg-white/50 blur-sm" />
                  <div className="absolute top-8 left-[30%] h-10 w-40 rounded-full bg-white/40 blur-sm" />
                  <div className="absolute top-2 right-[20%] h-14 w-36 rounded-full bg-white/45 blur-sm" />
                  <div className="absolute top-12 right-[40%] h-8 w-28 rounded-full bg-white/35 blur-sm" />

                  {/* Placed marker */}
                  {data.position && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-full"
                      style={{ left: data.position.x, top: data.position.y }}
                    >
                      <div className="flex flex-col items-center animate-bounce">
                        <MapPin className="size-10 text-primary fill-primary drop-shadow-lg" />
                      </div>
                      <p className="mt-1 text-center text-xs font-bold text-foreground bg-white/80 rounded px-2 py-0.5 shadow">
                        {data.petName}
                      </p>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {data.position ? (
        <p className="text-center text-sm text-oro-antico font-medium">
          Posizione scelta! Puoi cliccare di nuovo per spostarla.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Tocca o clicca sulla mappa per posizionare il memoriale
        </p>
      )}
    </div>
  )
}
```

**Step 2: Run dev and verify step 4**

Run: `pnpm dev`
Navigate to `/crea`, advance to step 4. Verify:
- Map renders with gradient paradise background and clouds
- Click places a pin with the pet name
- Zoom +/- buttons work
- Pan works (drag)
- "Crea memoriale" button enables after placing pin
- After create, success screen shows and redirects to /paradiso

**Step 3: Commit**

```bash
git add components/memorial/step-position.tsx
git commit -m "feat: add step 4 position picker with paradise mini-map"
```

---

### Task 7: Build Paradise Map page (`/paradiso`)

**Files:**
- Create: `components/paradise/paradise-map.tsx`
- Create: `app/paradiso/page.tsx`

**Step 1: Create the main paradise map component**

Create `components/paradise/paradise-map.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut, Plus, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemorialMarker } from "@/components/memorial/memorial-marker"
import { getMemorials, type Memorial } from "@/lib/memorials"
import { CloudOverlay } from "./cloud-overlay"
import { Rainbow } from "./rainbow"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Link from "next/link"

const MAP_WIDTH = 4000
const MAP_HEIGHT = 2400

export function ParadiseMap() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [selected, setSelected] = useState<Memorial | null>(null)

  useEffect(() => {
    setMemorials(getMemorials())
  }, [])

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <TransformWrapper
        initialScale={0.8}
        minScale={0.3}
        maxScale={4}
        centerOnInit
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <Button asChild variant="secondary" size="sm" className="shadow-md">
                <Link href="/">
                  <Home className="size-4" />
                  Home
                </Link>
              </Button>
            </div>

            <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => zoomIn()}>
                <ZoomIn className="size-5" />
              </Button>
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => zoomOut()}>
                <ZoomOut className="size-5" />
              </Button>
              <Button variant="secondary" size="icon" className="shadow-md" onClick={() => resetTransform()}>
                <Home className="size-5" />
              </Button>
            </div>

            {/* Create CTA */}
            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
              <Button asChild size="lg" className="h-14 px-8 text-lg shadow-xl">
                <Link href="/crea">
                  <Plus className="size-5" />
                  Crea un memoriale
                </Link>
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            >
              <div
                className="relative h-full w-full"
                style={{
                  background: `
                    linear-gradient(180deg,
                      #87CEEB 0%,
                      #a8d4e8 15%,
                      #B8D4E3 30%,
                      #c5e8c5 45%,
                      #a8d5a0 55%,
                      #90c990 70%,
                      #7abd7a 85%,
                      #6ab36a 100%
                    )`,
                }}
              >
                {/* Clouds */}
                <CloudOverlay />

                {/* Rainbow */}
                <Rainbow className="absolute left-[10%] top-[5%] h-[500px] w-[800px]" />
                <Rainbow className="absolute right-[5%] top-[10%] h-[400px] w-[600px] -scale-x-100" />

                {/* Decorative elements — scattered clouds on ground */}
                <div className="absolute top-[25%] left-[15%] h-20 w-60 rounded-full bg-white/25 blur-md" />
                <div className="absolute top-[20%] left-[50%] h-16 w-48 rounded-full bg-white/20 blur-md" />
                <div className="absolute top-[30%] right-[20%] h-24 w-72 rounded-full bg-white/30 blur-md" />

                {/* Memorial markers */}
                {memorials.map((m) => (
                  <div
                    key={m.id}
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: m.position.x, top: m.position.y }}
                  >
                    <MemorialMarker
                      memorial={m}
                      onClick={() => setSelected(m)}
                    />
                  </div>
                ))}

                {/* Empty state */}
                {memorials.length === 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="font-display text-2xl font-bold text-white/80">
                      Il paradiso attende il primo ricordo
                    </p>
                    <p className="mt-2 text-lg text-white/60">
                      Crea un memoriale per il tuo compagno
                    </p>
                  </div>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Memorial detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selected.petName}</DialogTitle>
                <DialogDescription>
                  {selected.petType === "dog" ? "Cane" : selected.petType === "cat" ? "Gatto" : "Animale"}
                  {selected.deathDate && ` — ci ha lasciato il ${new Date(selected.deathDate).toLocaleDateString("it-IT")}`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={selected.photo}
                  alt={selected.petName}
                  className="h-48 w-48 rounded-2xl object-cover shadow-lg"
                />
                <blockquote className="text-center text-base italic text-muted-foreground">
                  &ldquo;{selected.phrase}&rdquo;
                </blockquote>
                {(selected.birthDate || selected.deathDate) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {selected.birthDate && (
                      <span>Nato il {new Date(selected.birthDate).toLocaleDateString("it-IT")}</span>
                    )}
                    {selected.deathDate && (
                      <span>Scomparso il {new Date(selected.deathDate).toLocaleDateString("it-IT")}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href={`/memoriale/${selected.id}`}>Vedi memoriale completo</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

**Step 2: Create the /paradiso page**

Create `app/paradiso/page.tsx`:

```tsx
import { ParadiseMap } from "@/components/paradise/paradise-map"

export default function ParadisoPage() {
  return <ParadiseMap />
}
```

**Step 3: Run dev and verify**

Run: `pnpm dev`
Navigate to `/paradiso`. Verify:
- Map renders with paradise gradient, clouds, rainbow arcs
- Pan/zoom works smoothly (drag, scroll, pinch on mobile)
- If no memorials: empty state message shows
- Create a memorial via `/crea` flow, then verify it appears on map
- Click memorial opens detail dialog
- "Crea un memoriale" floating button navigates to /crea
- Home button navigates to /

**Step 4: Commit**

```bash
git add components/paradise/paradise-map.tsx app/paradiso/
git commit -m "feat: build paradise map page with infinite pan/zoom and memorial markers"
```

---

### Task 8: Build Memorial Detail page (`/memoriale/[id]`)

**Files:**
- Create: `app/memoriale/[id]/page.tsx`

**Step 1: Create the memorial detail page**

Create `app/memoriale/[id]/page.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getMemorial, type Memorial } from "@/lib/memorials"
import { Button } from "@/components/ui/button"
import { CloudOverlay } from "@/components/paradise/cloud-overlay"
import { Rainbow } from "@/components/paradise/rainbow"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Heart } from "lucide-react"

export default function MemorialePage() {
  const { id } = useParams<{ id: string }>()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const m = getMemorial(id)
    if (m) {
      setMemorial(m)
    } else {
      setNotFound(true)
    }
  }, [id])

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl font-bold">Memoriale non trovato</h1>
        <p className="mt-4 text-muted-foreground">
          Questo memoriale potrebbe essere stato rimosso o il link non e corretto.
        </p>
        <Button asChild className="mt-8">
          <Link href="/paradiso">Vai al paradiso</Link>
        </Button>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-celeste-paradiso/20 via-background to-rosa-aurora/15">
      <CloudOverlay />
      <Rainbow className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[600px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/paradiso">
            <ArrowLeft className="size-4" />
            Torna al paradiso
          </Link>
        </Button>

        <div className="mt-8 flex flex-col items-center text-center">
          {/* Photo */}
          <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-rosa-aurora/20">
            <img
              src={memorial.photo}
              alt={memorial.petName}
              className="h-72 w-72 object-cover"
            />
          </div>

          {/* Name */}
          <h1 className="mt-8 font-display text-4xl font-bold text-foreground md:text-5xl">
            {memorial.petName}
          </h1>

          {/* Type badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rosa-aurora/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="size-4 fill-current" />
            {memorial.petType === "dog" ? "Cane" : memorial.petType === "cat" ? "Gatto" : "Animale"}
          </div>

          {/* Dates */}
          {(memorial.birthDate || memorial.deathDate) && (
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-muted-foreground">
              {memorial.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Nato il {new Date(memorial.birthDate).toLocaleDateString("it-IT")}</span>
                </div>
              )}
              {memorial.deathDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Scomparso il {new Date(memorial.deathDate).toLocaleDateString("it-IT")}</span>
                </div>
              )}
            </div>
          )}

          {/* Memory phrase */}
          <blockquote className="mt-10 max-w-lg rounded-2xl bg-card/60 p-8 text-center text-xl italic leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
            &ldquo;{memorial.phrase}&rdquo;
          </blockquote>

          {/* Map link */}
          <div className="mt-10">
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/paradiso">
                <MapPin className="size-5" />
                Visita nel paradiso
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Run dev and verify**

Run: `pnpm dev`
Create a memorial, then navigate to its detail page via the paradise map dialog. Verify:
- Photo, name, type badge, dates, phrase all render
- "Torna al paradiso" button works
- Not-found state works for invalid IDs
- Paradise background with clouds and rainbow visible

**Step 3: Commit**

```bash
git add app/memoriale/
git commit -m "feat: build memorial detail page with paradise theme"
```

---

### Task 9: Add metadata, SEO, and polish

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/crea/page.tsx`
- Modify: `app/paradiso/page.tsx`

**Step 1: Add metadata to layout**

In `app/layout.tsx`, add before the default export:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Pethernity — Un paradiso per chi ci ha amato",
    template: "%s | Pethernity",
  },
  description:
    "Crea un memoriale unico per il tuo compagno a quattro zampe. Un angolo di paradiso digitale dove il suo ricordo vivra per sempre.",
}
```

**Step 2: Add page-level metadata**

In `app/page.tsx` add:
```tsx
export const metadata = {
  title: "Pethernity — Un paradiso per chi ci ha amato",
  description: "Crea un memoriale per il tuo animale domestico in un paradiso digitale tra nuvole e arcobaleni.",
}
```

In `app/crea/page.tsx` add:
```tsx
export const metadata = {
  title: "Crea un memoriale",
  description: "Racconta la storia del tuo compagno e dagli un posto speciale nel paradiso di Pethernity.",
}
```

In `app/paradiso/page.tsx` add:
```tsx
export const metadata = {
  title: "Il Paradiso",
  description: "Esplora il paradiso di Pethernity e visita i memoriali dei compagni a quattro zampe.",
}
```

**Step 3: Run typecheck and build**

Run: `pnpm typecheck && pnpm build`
Expected: No errors.

**Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx app/crea/page.tsx app/paradiso/page.tsx
git commit -m "feat: add metadata and SEO for all pages"
```

---

### Task 10: Final integration test

**Step 1: Full end-to-end manual test**

Run: `pnpm dev`

Test the complete flow:
1. **Landing page** (`/`): Hero renders, clouds animate, rainbow visible, both CTA buttons work
2. **Create flow** (`/crea`): Complete all 4 steps, create memorial
3. **Success animation**: Shows sparkle + redirect
4. **Paradise map** (`/paradiso`): Memorial marker visible, clickable, dialog opens with details
5. **Detail page** (`/memoriale/[id]`): Full memorial renders correctly
6. **Navigation**: All links work (Home, Back, Explore, etc.)
7. **Responsive**: Check on mobile viewport (375px width)
8. **Touch**: Verify zoom/pan on simulated touch

**Step 2: Run build to catch any issues**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address integration test issues"
```
