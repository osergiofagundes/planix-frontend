import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { NormalizedApiError } from "@/types/api.types"

interface FormErrorAlertProps {
  /** Erro já normalizado. `null` não renderiza nada. */
  error: NormalizedApiError | null
  title: string
  /** Ação opcional, como um link para outra tela. */
  children?: React.ReactNode
}

/**
 * Erro de nível de formulário — o que não pertence a um campo específico
 * (401 no login, 409 no cadastro, falha de rede). Erros de campo vão em
 * `FieldError`, abaixo do input correspondente.
 */
export function FormErrorAlert({
  error,
  title,
  children,
}: FormErrorAlertProps) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {children}
      </AlertDescription>
    </Alert>
  )
}
