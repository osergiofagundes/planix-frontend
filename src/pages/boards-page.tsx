import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

/**
 * Placeholder da área autenticada.
 *
 * Existe para provar o ciclo completo: o que aparece aqui veio de
 * `GET /api/auth/me`, uma requisição que só passa com o token válido no header.
 * Será substituído pela listagem real de quadros.
 */
export function BoardsPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-medium">Quadros</h1>
        <p className="text-xs text-muted-foreground">
          Ainda não há quadros por aqui — esta tela é o próximo passo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessão ativa</CardTitle>
          <CardDescription>
            Dados vindos de <code>GET /api/auth/me</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="text-muted-foreground">Id</dt>
            <dd className="font-mono">{user?.id}</dd>

            <dt className="text-muted-foreground">Nome</dt>
            <dd>{user?.name}</dd>

            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="break-all">{user?.email}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
