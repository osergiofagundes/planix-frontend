import { PlanixLogo } from "@/components/planix-logo"

interface AuthLayoutProps {
  /** Chamada principal do painel de marca. */
  title: string
  /** Subtítulo do painel de marca. */
  description: string
  children: React.ReactNode
}

/**
 * Moldura das telas de autenticação.
 *
 * Em telas grandes é um split-screen: painel de marca à esquerda, formulário à
 * direita. Abaixo de `lg` o painel some e sobra o card, ocupando a largura
 * disponível — sem scroll horizontal.
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r bg-muted/40 p-10 lg:flex">
        <PlanixLogo />

        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-medium text-balance">
            {title}
          </h1>
          <p className="max-w-sm text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Quadros, listas e cartões com etiquetas, prazos, checklists e
          histórico.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <PlanixLogo className="lg:hidden" />
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
