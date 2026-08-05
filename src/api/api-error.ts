import { AxiosError } from "axios"

import type { ApiErrorBody, NormalizedApiError } from "@/types/api.types"

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Tente novamente em alguns instantes."

const UNEXPECTED_ERROR_MESSAGE =
  "Algo deu errado. Tente novamente em alguns instantes."

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof AxiosError) {
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

export function hasFieldErrors(error: NormalizedApiError): boolean {
  return Object.keys(error.fieldErrors).length > 0
}
