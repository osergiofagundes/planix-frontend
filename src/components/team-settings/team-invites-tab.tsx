import { useState } from "react"
import { TicketIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TeamInviteDialog } from "@/components/team/team-invite-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRevokeInvite, useTeamInvites } from "@/hooks/use-invites"
import { formatDateTime, formatLongDate } from "@/lib/date"
import {
  INVITE_STATUS_LABELS,
  inviteStatus,
  type InviteResponse,
} from "@/types/invite.types"
import { TEAM_ROLE_LABELS } from "@/types/team.types"

interface TeamInvitesTabProps {
  teamId: number
  enabled: boolean
}

export function TeamInvitesTab({ teamId, enabled }: TeamInvitesTabProps) {
  const invites = useTeamInvites(teamId, enabled)
  const revokeInvite = useRevokeInvite(teamId)

  const [isCreating, setIsCreating] = useState(false)
  const [inviteToRevoke, setInviteToRevoke] = useState<InviteResponse | null>(
    null
  )

  const isEmpty = invites.isSuccess && invites.data.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites</CardTitle>
        <CardDescription>
          Quem abrir o link entra na equipe até ele expirar ou esgotar os usos.
          O acesso a cada quadro se ajusta depois, na aba Membros do quadro.
        </CardDescription>
        {!isEmpty && (
          <CardAction>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              Gerar convite
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {invites.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : isEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TicketIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum convite ainda</EmptyTitle>
              <EmptyDescription>
                Gere um convite para trazer mais pessoas para esta equipe.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsCreating(true)}>Gerar convite</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Entra como</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invites.data?.map((invite) => {
                  const status = inviteStatus(invite)

                  return (
                    <TableRow key={invite.id}>
                      <TableCell>{formatDateTime(invite.createdAt)}</TableCell>
                      <TableCell>{TEAM_ROLE_LABELS[invite.role]}</TableCell>
                      <TableCell>
                        {invite.uses} de {invite.maxUses}
                      </TableCell>
                      <TableCell>{formatLongDate(invite.expiresAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "ACTIVE" ? "secondary" : "outline"}
                        >
                          {INVITE_STATUS_LABELS[status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setInviteToRevoke(invite)}
                          >
                            Revogar
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <TeamInviteDialog
        teamId={teamId}
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {inviteToRevoke && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setInviteToRevoke(null)}
          title="Revogar este convite?"
          description="O link deixa de valer imediatamente, mesmo que ainda tenha usos e prazo. Quem já entrou continua na equipe."
          confirmLabel="Revogar"
          isPending={revokeInvite.isPending}
          onConfirm={() =>
            revokeInvite.mutate(inviteToRevoke.id, {
              onSuccess: () => setInviteToRevoke(null),
            })
          }
        />
      )}
    </Card>
  )
}
