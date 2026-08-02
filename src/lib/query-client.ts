import { QueryClient } from "@tanstack/react-query"

import { AxiosError } from "axios"

/**
 * Chaves de cache do React Query, centralizadas para evitar strings soltas
 * em invalidações espalhadas pelo código.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
}

/**
 * Não faz sentido tentar de novo um 4xx: o servidor já respondeu que a
 * requisição está errada. Repetir só atrasa o feedback ao usuário.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    if (status !== undefined && status >= 400 && status < 500) {
      return false
    }
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
