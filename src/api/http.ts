import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

import { API_ENDPOINTS, isPublicEndpoint } from "@/api/endpoints"
import { emitAuthLogout, tokenStorage } from "@/lib/token-storage"
import type { AuthResponse, RefreshRequest } from "@/types/auth.types"

const baseURL = import.meta.env.VITE_API_URL || ""

const DEFAULT_HEADERS = { "Content-Type": "application/json" }

export const api = axios.create({
  baseURL,
  headers: DEFAULT_HEADERS,
  timeout: 30_000,
})

const refreshClient = axios.create({
  baseURL,
  headers: DEFAULT_HEADERS,
  timeout: 30_000,
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

async function requestNewTokens(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) {
    throw new Error("Nenhum refresh token disponível.")
  }

  const payload: RefreshRequest = { refreshToken }
  const { data } = await refreshClient.post<AuthResponse>(
    API_ENDPOINTS.auth.refresh,
    payload
  )

  tokenStorage.setTokens(data)

  return data.accessToken
}

function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

function endSession(): void {
  tokenStorage.clear()
  emitAuthLogout()
}

api.interceptors.request.use((config) => {
  if (isPublicEndpoint(config.url)) {
    return config
  }

  const accessToken = tokenStorage.getAccessToken()

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined

    if (!config || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (isPublicEndpoint(config.url)) {
      return Promise.reject(error)
    }

    if (config._retry) {
      endSession()
      return Promise.reject(error)
    }

    if (!tokenStorage.getRefreshToken()) {
      endSession()
      return Promise.reject(error)
    }

    config._retry = true

    try {
      const accessToken = await refreshSession()
      config.headers.set("Authorization", `Bearer ${accessToken}`)
      return await api(config)
    } catch {
      endSession()
      return Promise.reject(error)
    }
  }
)
