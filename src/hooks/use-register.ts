import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"
import type { RegisterFormValues } from "@/schemas/auth.schema"
import { authService } from "@/services/auth.service"

export function useRegister() {
  const { startSession } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authService.register(values),
    onSuccess: (tokens) => {
      startSession(tokens)
      navigate(PATHS.boards, { replace: true })
    },
  })
}
