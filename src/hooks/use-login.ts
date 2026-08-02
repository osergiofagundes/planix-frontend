import { useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"
import type { LoginFormValues } from "@/schemas/auth.schema"
import { authService } from "@/services/auth.service"

interface RedirectState {
  /** Rota que o usuário tentou abrir antes de ser mandado para o login. */
  from?: string
}

export function useLogin() {
  const { startSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),
    onSuccess: (tokens) => {
      startSession(tokens)

      const from = (location.state as RedirectState | null)?.from
      navigate(from ?? PATHS.boards, { replace: true })
    },
  })
}
