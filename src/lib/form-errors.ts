import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import type { NormalizedApiError } from "@/types/api.types"

/**
 * Distribui os `fieldErrors` de um 400 nos campos do formulário.
 *
 * Campos que o formulário não conhece são ignorados — `setError` numa chave
 * inexistente cria um erro que nenhum input renderiza, e o usuário ficaria com
 * um formulário travado sem saber por quê.
 *
 * @returns `true` se pelo menos um campo recebeu erro. Quando `false`, cabe ao
 * chamador exibir a mensagem geral num `Alert`.
 */
export function applyApiFieldErrors<TValues extends FieldValues>(
  error: NormalizedApiError,
  setError: UseFormSetError<TValues>,
  knownFields: readonly Path<TValues>[]
): boolean {
  let applied = false

  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (!knownFields.includes(field as Path<TValues>)) {
      continue
    }

    setError(field as Path<TValues>, { type: "server", message })
    applied = true
  }

  return applied
}
