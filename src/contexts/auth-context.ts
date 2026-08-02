import { createContext } from "react"

import type { AuthResponse, AuthStatus, UserResponse } from "@/types/auth.types"

export interface AuthContextValue {
  /** Dados vindos de `GET /api/auth/me`. `null` enquanto carrega ou deslogado. */
  user: UserResponse | null
  status: AuthStatus
  isAuthenticated: boolean
  /** Persiste o par de tokens e dispara a hidratação do usuário. */
  startSession: (tokens: AuthResponse) => void
  /** Revoga o refresh token no backend, limpa o estado local e vai para o login. */
  logout: () => Promise<void>
}

/**
 * Fica em um arquivo próprio (sem componente) para não misturar exports de
 * componente e de valor no mesmo módulo — o que quebraria o fast refresh.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
