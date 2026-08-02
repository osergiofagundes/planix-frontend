import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/layouts/app-layout"
import { BoardsPage } from "@/pages/boards-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { RegisterPage } from "@/pages/register-page"
import { PATHS } from "@/routes/paths"
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
        <Route element={<AppLayout />}>
          <Route path={PATHS.boards} element={<BoardsPage />} />
        </Route>
      </Route>

      {/* A guarda de /boards se encarrega de mandar visitantes para o login. */}
      <Route path={PATHS.root} element={<Navigate to={PATHS.boards} replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
