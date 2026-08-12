import { Navigate, Outlet, useLocation } from "react-router-dom"

import { FullPageSpinner } from "@/components/full-page-spinner"
import { TeamProvider } from "@/contexts/team-provider"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"

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

  return (
    <TeamProvider>
      <Outlet />
    </TeamProvider>
  )
}
