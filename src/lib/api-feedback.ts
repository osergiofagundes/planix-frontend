import { normalizeApiError } from "@/api/api-error"
import { toast } from "@/components/ui/toast"
import type { NormalizedApiError } from "@/types/api.types"

function titleForStatus(status: number, fallback: string): string {
  if (status === 403) {
    return "Ação não permitida"
  }

  if (status === 404) {
    return "Não encontrado"
  }

  if (status === 409) {
    return "Conflito"
  }

  if (status === 413) {
    return "Arquivo grande demais"
  }

  if (status >= 500) {
    return "Erro no servidor"
  }

  return fallback
}

export function toastApiError(
  error: unknown,
  fallbackTitle = "Não foi possível concluir a ação"
): NormalizedApiError {
  const normalized = normalizeApiError(error)

  if (normalized.status === 401) {
    return normalized
  }

  toast.add({
    type: "error",
    title: normalized.isNetworkError
      ? "Sem conexão com o servidor"
      : titleForStatus(normalized.status, fallbackTitle),
    description: normalized.message,
  })

  return normalized
}

export function toastSuccess(title: string, description?: string): void {
  toast.add({ type: "success", title, description })
}
