"use client"

import { useContext } from "react"
import { AuthContext, type AuthContextType } from "@/components/auth/auth-provider"

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
