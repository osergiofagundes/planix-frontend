import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullPageSpinner } from "@/components/common/full-page-spinner"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"

export function PublicRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === "loading") {
    return <FullPageSpinner />
  }

  if (status === "authenticated") {
    const from = (location.state as { from?: string } | null)?.from

    return <Navigate to={from ?? PATHS.boards} replace />
  }

  return <Outlet />
}
