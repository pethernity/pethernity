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
