import { useContext } from "react"

import { AuthContext, type AuthContextValue } from "@/contexts/auth-context"

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.")
  }

  return context
}
