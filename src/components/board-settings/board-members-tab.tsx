import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CrownIcon, LogOutIcon, UserMinusIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import {
  useBoardMembers,
  useLeaveBoard,
  useRemoveMember,
  useTransferOwner,
} from "@/hooks/use-boards"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"
import type { UserSummary } from "@/types/user.types"

interface BoardMembersTabProps {
  board: BoardResponse
  isOwner: boolean
}

export function BoardMembersTab({ board, isOwner }: BoardMembersTabProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const boardId = String(board.id)
  const members = useBoardMembers(boardId)

  const removeMember = useRemoveMember(boardId)
  const transferOwner = useTransferOwner(boardId)
  const leaveBoard = useLeaveBoard()

  const [memberToRemove, setMemberToRemove] = useState<UserSummary | null>(null)
  const [memberToPromote, setMemberToPromote] = useState<UserSummary | null>(
    null
  )
  const [isLeaving, setIsLeaving] = useState(false)

  const count = members.data?.length ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros</CardTitle>
        <CardDescription>
          {members.isPending
            ? "Carregando…"
            : `${count} ${count === 1 ? "pessoa" : "pessoas"} neste quadro.`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {members.isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Condição</TableHead>
                  {isOwner && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {members.data?.map((member) => {
                  const isBoardOwner = member.id === board.owner.id
                  const isMe = member.id === user?.id

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={member}
                            size="sm"
                            showTooltip={false}
                          />
                          <span className="truncate">{member.name}</span>
                          {isMe && <Badge variant="outline">Você</Badge>}
                        </div>
                      </TableCell>

                      <TableCell>
                        {isBoardOwner ? (
                          <Badge variant="secondary">
                            <CrownIcon />
                            Dono
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Membro</span>
                        )}
                      </TableCell>

                      {isOwner && (
                        <TableCell className="text-right">
                          {isBoardOwner ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setMemberToPromote(member)}
                              >
                                Transferir posse
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                aria-label={`Remover ${member.name}`}
                                onClick={() => setMemberToRemove(member)}
                              >
                                <UserMinusIcon />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {!isOwner && (
        <CardFooter>
          <Button variant="outline" onClick={() => setIsLeaving(true)}>
            <LogOutIcon data-icon="inline-start" />
            Sair do quadro
          </Button>
        </CardFooter>
      )}

      {memberToRemove && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          title={`Remover ${memberToRemove.name}?`}
          description="A pessoa perde o acesso ao quadro e sai dos cartões em que era responsável."
          confirmLabel="Remover"
          isPending={removeMember.isPending}
          onConfirm={() =>
            removeMember.mutate(memberToRemove.id, {
              onSuccess: () => setMemberToRemove(null),
            })
          }
        />
      )}

      {memberToPromote && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setMemberToPromote(null)}
          title={`Transferir a posse para ${memberToPromote.name}?`}
          description="Você continua membro, mas perde os poderes de dono — inclusive o de desfazer esta transferência."
          confirmLabel="Transferir posse"
          destructive={false}
          isPending={transferOwner.isPending}
          onConfirm={() =>
            transferOwner.mutate(memberToPromote.id, {
              onSuccess: () => setMemberToPromote(null),
            })
          }
        />
      )}

      {isLeaving && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setIsLeaving(false)}
          title={`Sair de "${board.name}"?`}
          description="Você perde o acesso ao quadro e sai dos cartões em que era responsável. Para voltar, vai precisar de um novo convite."
          confirmLabel="Sair do quadro"
          isPending={leaveBoard.isPending}
          onConfirm={() =>
            leaveBoard.mutate(board.id, {
              onSuccess: () => navigate(PATHS.boards, { replace: true }),
            })
          }
        />
      )}
    </Card>
  )
}
