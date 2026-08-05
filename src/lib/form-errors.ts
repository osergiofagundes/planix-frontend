import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import type { NormalizedApiError } from "@/types/api.types"

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
