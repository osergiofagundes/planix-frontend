import { useState } from "react"
import { Outlet } from "react-router-dom"
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react"

import { PlanixLogo } from "@/components/planix-logo"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"

/** Casca da área autenticada: cabeçalho fixo + conteúdo da rota. */
export function AppLayout() {
  const { user, logout } = useAuth()
  const { setTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
        <PlanixLogo />

        <div className="ml-auto flex items-center gap-2">
          {/* O nome ocupa espaço demais no mobile; o avatar textual basta lá. */}
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {user?.name}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LogOutIcon data-icon="inline-start" />
            )}
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
