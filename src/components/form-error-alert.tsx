import type { ReactNode } from "react"
import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { NormalizedApiError } from "@/types/api.types"

interface FormErrorAlertProps {
  error: NormalizedApiError | null
  title: string
  children?: ReactNode
}

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
