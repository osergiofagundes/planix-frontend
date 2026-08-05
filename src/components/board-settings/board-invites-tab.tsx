import { useState } from "react"
import { TicketIcon } from "lucide-react"

import { InviteDialog } from "@/components/board/invite-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
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
import { useBoardInvites, useRevokeInvite } from "@/hooks/use-invites"
import { formatDateTime, formatLongDate } from "@/lib/date"
import {
  INVITE_STATUS_LABELS,
  inviteStatus,
  type InviteResponse,
} from "@/types/invite.types"

interface BoardInvitesTabProps {
  boardId: string
  enabled: boolean
}

export function BoardInvitesTab({ boardId, enabled }: BoardInvitesTabProps) {
  const invites = useBoardInvites(boardId, enabled)
  const revokeInvite = useRevokeInvite(boardId)

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
          Qualquer pessoa com o link entra no quadro até ele expirar ou esgotar
          os usos.
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
                Gere um convite para dar acesso a mais pessoas a este quadro.
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

      <InviteDialog
        boardId={boardId}
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {inviteToRevoke && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setInviteToRevoke(null)}
          title="Revogar este convite?"
          description="O link deixa de valer imediatamente, mesmo que ainda tenha usos e prazo. Quem já entrou continua membro."
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
