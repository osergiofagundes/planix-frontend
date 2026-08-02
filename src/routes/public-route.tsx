import { Navigate, Outlet } from "react-router-dom"

import { FullPageSpinner } from "@/components/full-page-spinner"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"

/** Mantém quem já está logado fora das telas de login e cadastro. */
export function PublicRoute() {
  const { status } = useAuth()

  if (status === "loading") {
    return <FullPageSpinner />
  }

  if (status === "authenticated") {
    return <Navigate to={PATHS.boards} replace />
  }

  return <Outlet />
}
