import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios"

import { API_ENDPOINTS, isPublicEndpoint } from "@/api/endpoints"
import { emitAuthLogout, tokenStorage } from "@/lib/token-storage"
import type { AuthResponse, RefreshRequest } from "@/types/auth.types"

/**
 * Cliente HTTP da Planix API.
 *
 * Duas responsabilidades:
 *  1. anexar `Authorization: Bearer <accessToken>` nas rotas protegidas;
 *  2. renovar o access token de forma transparente quando ele expira (401),
 *     repetindo a requisição original.
 */

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  console.error(
    "VITE_API_URL não está definida. Copie o .env.example para .env antes de rodar a aplicação."
  )
}

const DEFAULT_HEADERS = { "Content-Type": "application/json" }

export const api = axios.create({
  baseURL,
  headers: DEFAULT_HEADERS,
  timeout: 30_000,
})

/**
 * Instância separada, sem interceptors, usada exclusivamente para o refresh.
 * Se o refresh passasse pelo `api`, um 401 nele dispararia outro refresh —
 * recursão infinita.
 */
const refreshClient = axios.create({
  baseURL,
  headers: DEFAULT_HEADERS,
  timeout: 30_000,
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  /** Marca requisições já repetidas, para não entrar em laço de refresh. */
  _retry?: boolean
}

/**
 * Refresh em voo, compartilhado por todas as requisições que tomarem 401 ao
 * mesmo tempo. O refresh token é de uso único: dois refreshes simultâneos
 * fariam o segundo falhar, derrubando a sessão sem necessidade.
 */
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

  // O backend devolve um refresh token novo e revoga o anterior — precisa
  // sobrescrever os dois, não só o access.
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

    // 401 em login/register/refresh é resposta de negócio ("credenciais
    // inválidas", "refresh expirado"), não token vencido.
    if (isPublicEndpoint(config.url)) {
      return Promise.reject(error)
    }

    if (config._retry) {
      // Já tentamos renovar uma vez e o servidor recusou de novo.
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
