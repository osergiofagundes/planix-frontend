import { Navigate, Route, Routes } from "react-router-dom"

import { CardDetailDialog } from "@/components/card-detail/card-detail-dialog"
import { AppLayout } from "@/layouts/app-layout"
import { AcceptInvitePage } from "@/pages/accept-invite-page"
import { BoardPage } from "@/pages/board-page"
import { BoardsPage } from "@/pages/boards-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { RegisterPage } from "@/pages/register-page"
import { PATHS, ROUTE_PATTERNS } from "@/routes/paths"
import { ProtectedRoute } from "@/routes/protected-route"
import { PublicRoute } from "@/routes/public-route"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTE_PATTERNS.invite} element={<AcceptInvitePage />} />

        <Route element={<AppLayout />}>
          <Route path={PATHS.boards} element={<BoardsPage />} />

          <Route path={ROUTE_PATTERNS.board} element={<BoardPage />}>
            <Route path={ROUTE_PATTERNS.card} element={<CardDetailDialog />} />
          </Route>

        </Route>

      </Route>

      <Route path={PATHS.root} element={<Navigate to={PATHS.boards} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
