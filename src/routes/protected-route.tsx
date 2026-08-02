import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullPageSpinner } from "@/components/full-page-spinner"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"

/**
 * Barra o acesso de quem não está autenticado.
 *
 * Enquanto o status é `loading` mostra o spinner em vez de redirecionar: numa
 * atualização de página com token válido, redirecionar cedo demais chutaria o
 * usuário para o login antes de o `/api/auth/me` responder.
 */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === "loading") {
    return <FullPageSpinner />
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to={PATHS.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}
