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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  useChangeTeamRole,
  useLeaveTeam,
  useRemoveTeamMember,
  useTeamMembers,
  useTransferTeamOwner,
} from "@/hooks/use-teams"
import { PATHS } from "@/routes/paths"
import {
  TEAM_ROLE_LABELS,
  type TeamMemberResponse,
  type TeamResponse,
  type TeamRole,
} from "@/types/team.types"

const ROLE_ITEMS = [
  { value: "MEMBER" as const, label: TEAM_ROLE_LABELS.MEMBER },
  { value: "ADMIN" as const, label: TEAM_ROLE_LABELS.ADMIN },
]

export function TeamMembersTab({ team }: { team: TeamResponse }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isOwner = team.myRole === "OWNER"
  const isAdmin = team.myRole === "OWNER" || team.myRole === "ADMIN"

  const members = useTeamMembers(team.id)
  const changeRole = useChangeTeamRole(team.id)
  const removeMember = useRemoveTeamMember(team.id)
  const transferOwner = useTransferTeamOwner(team.id)
  const leaveTeam = useLeaveTeam()

  const [memberToRemove, setMemberToRemove] =
    useState<TeamMemberResponse | null>(null)
  const [memberToPromote, setMemberToPromote] =
    useState<TeamMemberResponse | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  const count = members.data?.length ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros</CardTitle>
        <CardDescription>
          {members.isPending
            ? "Carregando…"
            : `${count} ${count === 1 ? "pessoa" : "pessoas"} nesta equipe. Para trazer mais gente, gere um convite.`}
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
                  <TableHead>Papel</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {members.data?.map((member) => {
                  const isTeamOwner = member.role === "OWNER"
                  const isMe = member.user.id === user?.id

                  return (
                    <TableRow key={member.user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={member.user}
                            size="sm"
                            showTooltip={false}
                          />
                          <span className="truncate">{member.user.name}</span>
                          {isMe && <Badge variant="outline">Você</Badge>}
                        </div>
                      </TableCell>

                      <TableCell>
                        {isTeamOwner ? (
                          <Badge variant="secondary">
                            <CrownIcon />
                            {TEAM_ROLE_LABELS.OWNER}
                          </Badge>
                        ) : isOwner ? (
                          <Select
                            items={ROLE_ITEMS}
                            value={member.role}
                            onValueChange={(value) =>
                              changeRole.mutate({
                                userId: member.user.id,
                                role: value as Exclude<TeamRole, "OWNER">,
                              })
                            }
                          >
                            <SelectTrigger
                              className="w-40"
                              aria-label={`Papel de ${member.user.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {ROLE_ITEMS.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">
                            {TEAM_ROLE_LABELS[member.role]}
                          </span>
                        )}
                      </TableCell>

                      {isAdmin && (
                        <TableCell className="text-right">
                          {isTeamOwner ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex justify-end gap-1">
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setMemberToPromote(member)}
                                >
                                  Transferir posse
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="xs"
                                aria-label={`Remover ${member.user.name}`}
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
            Sair da equipe
          </Button>
        </CardFooter>
      )}

      {memberToRemove && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          title={`Remover ${memberToRemove.user.name} da equipe?`}
          description="A pessoa perde o acesso a todos os quadros desta equipe e sai dos cartões em que era responsável."
          confirmLabel="Remover"
          isPending={removeMember.isPending}
          onConfirm={() =>
            removeMember.mutate(memberToRemove.user.id, {
              onSuccess: () => setMemberToRemove(null),
            })
          }
        />
      )}

      {memberToPromote && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setMemberToPromote(null)}
          title={`Transferir a posse para ${memberToPromote.user.name}?`}
          description="Você continua administrando a equipe, mas perde os poderes de dono — inclusive o de desfazer esta transferência."
          confirmLabel="Transferir posse"
          destructive={false}
          isPending={transferOwner.isPending}
          onConfirm={() =>
            transferOwner.mutate(memberToPromote.user.id, {
              onSuccess: () => setMemberToPromote(null),
            })
          }
        />
      )}

      {isLeaving && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setIsLeaving(false)}
          title={`Sair de "${team.name}"?`}
          description="Você perde o acesso a todos os quadros desta equipe e sai dos cartões em que era responsável. Para voltar, vai precisar de um novo convite."
          confirmLabel="Sair da equipe"
          isPending={leaveTeam.isPending}
          onConfirm={() =>
            leaveTeam.mutate(team.id, {
              onSuccess: () => navigate(PATHS.boards, { replace: true }),
            })
          }
        />
      )}
    </Card>
  )
}
