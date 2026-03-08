"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "./auth-modal"
import { LogIn, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)}>
          <LogIn className="size-4" />
          Accedi
        </Button>
        <AuthModal
          open={showAuth}
          onOpenChange={setShowAuth}
          onAuthSuccess={() => setShowAuth(false)}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="size-4" />
          {user.user_metadata?.display_name || user.email?.split("@")[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" />
          Esci
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
