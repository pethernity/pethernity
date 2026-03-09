import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "ciao ciao",
  description: "Crea un memoriale per il tuo animale domestico in un paradiso digitale tra nuvole e arcobaleni.",
}

export default function Page() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Footer />
    </main>
  )
}
