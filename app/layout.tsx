import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Pethernity — Un paradiso per chi ci ha amato",
    template: "%s | Pethernity",
  },
  description:
    "Crea un memoriale unico per il tuo compagno a quattro zampe. Un angolo di paradiso digitale dove il suo ricordo vivra per sempre.",
}

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
})

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontDisplay.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
