import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeftIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { normalizeApiError } from "@/api/api-error"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ErrorState } from "@/components/common/error-state"
import { PlanixLogo } from "@/components/common/planix-logo"
import { DeleteTeamDialog } from "@/components/team/delete-team-dialog"
import { TeamFormDialog } from "@/components/team/team-form-dialog"
import {
  TEAM_SETTINGS_PARAM,
  TeamSettingsDialog,
} from "@/components/team-settings/team-settings-dialog"
import { UserAvatar } from "@/components/common/user-avatar"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useActiveTeam } from "@/hooks/use-active-team"
import { useLeaveTeam, useTeams } from "@/hooks/use-teams"
import { PATHS } from "@/routes/paths"
import {
  isTeamAdmin,
  TEAM_ROLE_LABELS,
  type TeamResponse,
} from "@/types/team.types"

const FALLBACK_ICON = "building-2" as IconName

export function TeamsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { setActiveTeam } = useActiveTeam()

  const teams = useTeams()
  const leaveTeam = useLeaveTeam()

  const [isCreating, setIsCreating] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<TeamResponse | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<TeamResponse | null>(null)
  const [teamToLeave, setTeamToLeave] = useState<TeamResponse | null>(null)

  function open(team: TeamResponse) {
    setActiveTeam(team.id)
    navigate(PATHS.boards)
  }

  function openSettings(team: TeamResponse) {
    setActiveTeam(team.id)

    const params = new URLSearchParams(searchParams)
    params.set(TEAM_SETTINGS_PARAM, "geral")
    setSearchParams(params)
  }

  return (
    <div className="flex min-h-svh flex-col gap-8 p-4 sm:p-10">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <PlanixLogo />

          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to={PATHS.boards} />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Voltar aos quadros
          </Button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-medium">Suas equipes</h1>
          </div>

          <Button size="sm" onClick={() => setIsCreating(true)}>
            <PlusIcon data-icon="inline-start" />
            Nova equipe
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {teams.isPending && <TeamsSkeleton />}

        {teams.isError && (
          <ErrorState
            error={normalizeApiError(teams.error)}
            onRetry={() => teams.refetch()}
            showBackToBoards={false}
          />
        )}

        {teams.isSuccess && teams.data.length === 0 && (
          <Empty className="min-h-[50svh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhuma equipe ainda</EmptyTitle>
              <EmptyDescription>
                Os quadros moram dentro de uma equipe. Crie a primeira para
                começar. Depois é só convidar quem trabalha com você.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsCreating(true)}>
                <PlusIcon data-icon="inline-start" />
                Criar equipe
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {teams.isSuccess && teams.data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.data.map((team) => (
              <li key={team.id}>
                <TeamCard
                  team={team}
                  onOpen={() => open(team)}
                  onSettings={() => openSettings(team)}
                  onEdit={() => setTeamToEdit(team)}
                  onLeave={() => setTeamToLeave(team)}
                  onDelete={() => setTeamToDelete(team)}
                />
              </li>
            ))}
          </ul>
        )}

        <TeamFormDialog
          open={isCreating}
          onOpenChange={setIsCreating}
          onCreated={(team) => setActiveTeam(team.id)}
        />

        {teamToEdit && (
          <TeamFormDialog
            open
            onOpenChange={(open) => !open && setTeamToEdit(null)}
            team={teamToEdit}
          />
        )}

        {teamToDelete && (
          <DeleteTeamDialog
            open
            onOpenChange={(open) => !open && setTeamToDelete(null)}
            team={teamToDelete}
          />
        )}

        {teamToLeave && (
          <ConfirmDialog
            open
            onOpenChange={(open) => !open && setTeamToLeave(null)}
            title={`Sair de "${teamToLeave.name}"?`}
            description="Você perde o acesso a todos os quadros desta equipe e sai dos cartões em que era responsável. Para voltar, vai precisar de um novo convite."
            confirmLabel="Sair da equipe"
            isPending={leaveTeam.isPending}
            onConfirm={() =>
              leaveTeam.mutate(teamToLeave.id, {
                onSuccess: () => setTeamToLeave(null),
              })
            }
          />
        )}

        <TeamSettingsDialog />
      </div>
    </div>
  )
}

interface TeamCardProps {
  team: TeamResponse
  onOpen: () => void
  onSettings: () => void
  onEdit: () => void
  onLeave: () => void
  onDelete: () => void
}

function TeamCard({
  team,
  onOpen,
  onSettings,
  onEdit,
  onLeave,
  onDelete,
}: TeamCardProps) {
  const canManage = isTeamAdmin(team.myRole)
  const isOwner = team.myRole === "OWNER"

  return (
    <Card className="relative h-full border transition-colors hover:border-primary/50">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <DynamicIcon
            name={(team.icon ?? FALLBACK_ICON) as IconName}
            aria-hidden
            className="size-4 shrink-0"
          />
          <button
            type="button"
            onClick={onOpen}
            className="truncate text-left after:absolute after:inset-0 after:content-['']"
          >
            {team.name}
          </button>
        </CardTitle>

        <CardDescription className="line-clamp-2 min-h-8">
          {team.description || "Sem descrição."}
        </CardDescription>

        <CardAction className="relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label={`Ações da equipe ${team.name}`}
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={onSettings} className="hover:cursor-pointer">
                      <SettingsIcon />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit} className="hover:cursor-pointer">
                      <PencilIcon />
                      Editar
                    </DropdownMenuItem>
                  </>
                )}

                {!isOwner && (
                  <DropdownMenuItem variant="destructive" onClick={onLeave} className="hover:cursor-pointer">
                    <LogOutIcon />
                    Sair da equipe
                  </DropdownMenuItem>
                )}

                {isOwner && (
                  <DropdownMenuItem variant="destructive" onClick={onDelete} className="hover:cursor-pointer">
                    <Trash2Icon />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {plural(team.memberCount, "membro", "membros")} ·{" "}
          {plural(team.boardCount, "quadro", "quadros")}
        </p>

        <div className="flex items-center gap-2">
          <UserAvatar user={team.owner} size="sm" />
          <span className="truncate text-xs text-muted-foreground">
            {team.owner.name}
          </span>
          <Badge variant="outline" className="ml-auto shrink-0">
            {TEAM_ROLE_LABELS[team.myRole]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

function TeamsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
