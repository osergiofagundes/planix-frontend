import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { AuthContext, type AuthContextValue } from "@/contexts/auth-context"
import { queryKeys } from "@/lib/query-client"
import { AUTH_LOGOUT_EVENT, tokenStorage } from "@/lib/token-storage"
import { PATHS } from "@/routes/paths"
import { authService } from "@/services/auth.service"
import type { AuthResponse, AuthStatus } from "@/types/auth.types"

/**
 * Dono do estado de sessão.
 *
 * A fonte da verdade sobre "quem está logado" é sempre `GET /api/auth/me`:
 * o token no localStorage só diz que vale a pena perguntar. Se ele estiver
 * vencido, o interceptor renova antes de a resposta chegar aqui.
 *
 * Precisa ficar dentro de `<BrowserRouter>` (usa `useNavigate`) e dentro de
 * `<QueryClientProvider>` (usa `useQuery`).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Só habilita a consulta ao /me quando existe token guardado — sem isso,
  // toda visita anônima faria um 401 desnecessário.
  const [hasStoredToken, setHasStoredToken] = useState(tokenStorage.hasSession)

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled: hasStoredToken,
    retry: false,
    staleTime: Infinity,
  })

  const clearLocalSession = useCallback(() => {
    tokenStorage.clear()
    setHasStoredToken(false)
    queryClient.clear()
  }, [queryClient])

  const startSession = useCallback(
    (tokens: AuthResponse) => {
      tokenStorage.setTokens(tokens)
      // Descarta qualquer usuário de uma sessão anterior antes de habilitar a
      // consulta, senão a tela mostraria o nome de quem estava logado antes.
      queryClient.removeQueries({ queryKey: queryKeys.auth.me })
      setHasStoredToken(true)
    },
    [queryClient]
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()

    if (refreshToken) {
      try {
        await authService.logout({ refreshToken })
      } catch {
        // Best-effort: se o backend não responder, a sessão local cai do mesmo jeito.
      }
    }

    clearLocalSession()
    navigate(PATHS.login, { replace: true })
  }, [clearLocalSession, navigate])

  // O interceptor avisa por evento quando o refresh é recusado — assim o
  // `http.ts` não precisa conhecer o router nem o React Query.
  useEffect(() => {
    const handleForcedLogout = () => {
      clearLocalSession()
      navigate(PATHS.login, { replace: true })
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)
    }
  }, [clearLocalSession, navigate])

  const status: AuthStatus = useMemo(() => {
    if (!hasStoredToken) {
      return "unauthenticated"
    }

    if (meQuery.isSuccess) {
      return "authenticated"
    }

    // O /me falhou mesmo após a tentativa de refresh: o token não vale mais.
    if (meQuery.isError) {
      return "unauthenticated"
    }

    return "loading"
  }, [hasStoredToken, meQuery.isSuccess, meQuery.isError])

  const value: AuthContextValue = useMemo(
    () => ({
      user: meQuery.data ?? null,
      status,
      isAuthenticated: status === "authenticated",
      startSession,
      logout,
    }),
    [meQuery.data, status, startSession, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
