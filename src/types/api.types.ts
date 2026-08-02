/** Tipos transversais da comunicação com a Planix API. */

/**
 * Corpo padrão de qualquer resposta de erro da API (schema `ApiError`).
 * `fieldErrors` só vem preenchido nos 400 de validação.
 */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string> | null
}

/**
 * Erro já normalizado para consumo na UI.
 * `status` é `0` quando a requisição nem chegou ao servidor (rede fora, CORS bloqueado).
 */
export interface NormalizedApiError {
  status: number
  message: string
  fieldErrors: Record<string, string>
  /** `true` quando não houve resposta do servidor. */
  isNetworkError: boolean
}
