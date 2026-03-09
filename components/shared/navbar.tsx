"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { Plus, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/paradiso", label: "Paradiso" },
  { href: "/comunita", label: "Comunita" },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const hidden = pathname === "/paradiso"

  useEffect(() => {
    if (hidden) return
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [hidden])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Hide navbar on paradise map (it has its own UI)
  if (hidden) return null

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 shadow-sm backdrop-blur-md border-b border-rosa-aurora/10"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Pethernity
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/crea">
              <Plus className="size-4" />
              Crea memoriale
            </Link>
          </Button>
          <UserMenu />

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-rosa-aurora/10 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/crea"
              className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground sm:hidden"
            >
              Crea memoriale
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
