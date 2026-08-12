import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { AuthContext, type AuthContextValue } from "@/contexts/auth-context"
import { queryKeys } from "@/lib/query-client"
import { AUTH_LOGOUT_EVENT, tokenStorage } from "@/lib/token-storage"
import { PATHS } from "@/routes/paths"
import { authService } from "@/services/auth.service"
import type { AuthResponse, AuthStatus } from "@/types/auth.types"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
      queryClient.removeQueries({ queryKey: queryKeys.auth.me })
      setHasStoredToken(true)
    },
    [queryClient]
  )

  const renewSession = useCallback(
    (tokens: AuthResponse) => {
      tokenStorage.setTokens(tokens)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
    [queryClient]
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()

    if (refreshToken) {
      try {
        await authService.logout({ refreshToken })
      } catch {
        // Invalidar o refresh token no servidor é desejável, não obrigatório:
        // se a chamada falhar, a sessão local é limpa do mesmo jeito abaixo.
      }
    }

    clearLocalSession()
    navigate(PATHS.login, { replace: true })
  }, [clearLocalSession, navigate])

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
      renewSession,
      logout,
    }),
    [meQuery.data, status, startSession, renewSession, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
