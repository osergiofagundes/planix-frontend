import { Link } from "react-router-dom"

import { PlanixLogo } from "@/components/common/planix-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"

export function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <PlanixLogo />

      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="font-heading text-xl font-medium">
          Esta página não existe.
        </h1>
        <p className="text-xs text-muted-foreground">
          O endereço pode ter mudado ou o link está incompleto.
        </p>
      </div>

      <Button
        nativeButton={false}
        render={<Link to={isAuthenticated ? PATHS.boards : PATHS.login} />}
      >
        {isAuthenticated ? "Voltar aos quadros" : "Ir para o login"}
      </Button>
    </div>
  )
}
