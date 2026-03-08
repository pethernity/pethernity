import type { Metadata } from "next"
import { ParadiseMap } from "@/components/paradise/paradise-map"

export const metadata: Metadata = {
  title: "Il Paradiso",
  description: "Esplora il paradiso di Pethernity e visita i memoriali dei compagni a quattro zampe.",
}

export default function ParadisoPage() {
  return <ParadiseMap />
}
