import { createContext } from "react"

import type { AuthResponse, AuthStatus, UserResponse } from "@/types/auth.types"

export interface AuthContextValue {
  user: UserResponse | null
  status: AuthStatus
  isAuthenticated: boolean
  startSession: (tokens: AuthResponse) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
