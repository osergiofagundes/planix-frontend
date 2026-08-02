import { AxiosError } from "axios"

import type { ApiErrorBody, NormalizedApiError } from "@/types/api.types"

/**
 * Traduz qualquer falha (resposta `ApiError`, erro de rede ou exceção solta)
 * para um formato único que a UI sabe renderizar.
 */

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique se a API está no ar e tente novamente."

const UNEXPECTED_ERROR_MESSAGE =
  "Algo deu errado. Tente novamente em alguns instantes."

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof AxiosError) {
    // Sem `response` significa que a requisição não chegou ao servidor:
    // API fora do ar, DNS, timeout ou preflight de CORS bloqueado.
    if (!error.response) {
      return {
        status: 0,
        message: NETWORK_ERROR_MESSAGE,
        fieldErrors: {},
        isNetworkError: true,
      }
    }

    const body = error.response.data as ApiErrorBody | undefined

    return {
      status: error.response.status,
      message: body?.message?.trim() || UNEXPECTED_ERROR_MESSAGE,
      fieldErrors: body?.fieldErrors ?? {},
      isNetworkError: false,
    }
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : UNEXPECTED_ERROR_MESSAGE,
    fieldErrors: {},
    isNetworkError: false,
  }
}

/** `true` quando o erro tem `fieldErrors` para distribuir entre os campos do formulário. */
export function hasFieldErrors(error: NormalizedApiError): boolean {
  return Object.keys(error.fieldErrors).length > 0
}
