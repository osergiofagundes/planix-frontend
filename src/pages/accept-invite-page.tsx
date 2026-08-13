import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MailPlusIcon, TicketXIcon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { PlanixLogo } from "@/components/common/planix-logo"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useActiveTeam } from "@/hooks/use-active-team"
import { useAcceptInvite, useInvitePreview } from "@/hooks/use-invites"
import { formatLongDate } from "@/lib/date"
import { PATHS } from "@/routes/paths"

export function AcceptInvitePage() {
  const { token: tokenFromUrl } = useParams<{ token?: string }>()
  const navigate = useNavigate()
  const { setActiveTeam } = useActiveTeam()

  const [token, setToken] = useState(tokenFromUrl ?? "")

  const preview = useInvitePreview()
  const accept = useAcceptInvite()

  useEffect(() => {
    if (tokenFromUrl) {
      preview.mutate(tokenFromUrl)
    }
  }, [tokenFromUrl])

  function handlePreview(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = token.trim()

    if (trimmed) {
      preview.mutate(trimmed)
    }
  }

  function handleAccept() {
    accept.mutate(token.trim(), {
      onSuccess: (team) => {
        setActiveTeam(team.id)
        navigate(PATHS.boards, { replace: true })
      },
    })
  }

  const previewError = preview.error ? normalizeApiError(preview.error) : null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <PlanixLogo />

      <Card className="w-full max-w-sm">
        {preview.isPending ? (
          <>
            <CardHeader>
              <CardTitle>Conferindo o convite…</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </>
        ) : preview.data ? (
          <>
            <CardHeader>
              <CardTitle>Convite válido</CardTitle>
              <CardDescription>{preview.data.teamName}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <UserAvatar
                  user={preview.data.invitedBy}
                  size="sm"
                  showTooltip={false}
                />
                <span>
                  <span className="font-medium">
                    {preview.data.invitedBy.name}
                  </span>{" "}
                  convidou você
                </span>
              </div>

              <p className="text-muted-foreground">
                Este convite vale até {formatLongDate(preview.data.expiresAt)}.
              </p>
            </CardContent>

            <CardFooter className="flex-wrap gap-2">
              <Button onClick={handleAccept} disabled={accept.isPending}>
                {accept.isPending && <Spinner data-icon="inline-start" />}
                Entrar na equipe
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to={PATHS.boards} />}
              >
                Cancelar
              </Button>
            </CardFooter>
          </>
        ) : previewError ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketXIcon className="size-4" />
                Convite inválido ou expirado
              </CardTitle>
              <CardDescription>
                O token pode já ter sido usado, esgotado ou passado do prazo.
                Peça um novo para quem administra a equipe.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-token" required>
                    Token informado
                  </FieldLabel>
                  <Input
                    id="invite-token"
                    autoComplete="off"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>

            <CardFooter className="flex-wrap gap-2">
              <Button
                onClick={() => preview.mutate(token.trim())}
                disabled={!token.trim()}
              >
                Tentar outro token
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to={PATHS.boards} />}
              >
                Ir para meus quadros
              </Button>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handlePreview}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailPlusIcon className="size-4" />
                Entrar em uma equipe
              </CardTitle>
              <CardDescription>
                Cole o token ou o link que você recebeu de quem administra a
                equipe.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-token" required>
                    Token do convite
                  </FieldLabel>
                  <Input
                    id="invite-token"
                    autoFocus
                    autoComplete="off"
                    value={token}
                    onChange={(event) =>
                      setToken(extractToken(event.target.value))
                    }
                  />
                  <FieldDescription>
                    O token tem prazo de validade e um limite de usos.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={!token.trim()}>
                Ver convite
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

function extractToken(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(/\/convite\/([^/?#]+)/)

  return match ? decodeURIComponent(match[1]) : trimmed
}
