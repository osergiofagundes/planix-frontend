import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SquareKanbanIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { normalizeApiError } from "@/api/api-error"
import { BoardFormDialog } from "@/components/board/board-form-dialog"
import { DeleteBoardDialog } from "@/components/board/delete-board-dialog"
import { ErrorState } from "@/components/common/error-state"
import { PageTopbar } from "@/components/layout/page-topbar"
import {
  TopbarTitle,
  type TopbarTitleSegment,
} from "@/components/layout/topbar-title"
import { TeamFormDialog } from "@/components/team/team-form-dialog"
import { UserAvatar } from "@/components/common/user-avatar"
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
import { useBoards } from "@/hooks/use-boards"
import { formatRelativeTime } from "@/lib/date"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"

const FALLBACK_ICON = "square-kanban" as IconName
const TEAM_FALLBACK_ICON = "building-2" as IconName

export function BoardsPage() {
  const navigate = useNavigate()
  const { activeTeam, isPending: isLoadingTeams } = useActiveTeam()
  const boards = useBoards(activeTeam?.id)

  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [boardToEdit, setBoardToEdit] = useState<BoardResponse | null>(null)
  const [boardToDelete, setBoardToDelete] = useState<BoardResponse | null>(null)

  const hasNoTeam = !isLoadingTeams && !activeTeam

  const titleSegments: TopbarTitleSegment[] = [
    ...(activeTeam
      ? [
          {
            icon: (activeTeam.icon ?? TEAM_FALLBACK_ICON) as IconName,
            label: activeTeam.name,
            hideOnMobile: true,
          },
        ]
      : []),
    { icon: FALLBACK_ICON, label: "Quadros" },
  ]

  return (
    <>
      <PageTopbar>
        <TopbarTitle segments={titleSegments} />

        {activeTeam && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <PlusIcon data-icon="inline-start" />
            Novo quadro
          </Button>
        )}
      </PageTopbar>

      <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-6">
        {hasNoTeam && (
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
              <Button onClick={() => setIsCreatingTeam(true)}>
                <PlusIcon data-icon="inline-start" />
                Criar equipe
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!hasNoTeam && boards.isPending && <BoardsSkeleton />}

        {boards.isError && (
          <ErrorState
            error={normalizeApiError(boards.error)}
            onRetry={() => boards.refetch()}
            showBackToBoards={false}
          />
        )}

        {activeTeam && boards.isSuccess && boards.data.length === 0 && (
          <Empty className="min-h-[50svh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SquareKanbanIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum quadro nesta equipe</EmptyTitle>
              <EmptyDescription>
                Crie o primeiro quadro de {activeTeam.name} para começar a
                organizar listas e cartões.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsCreating(true)}>
                <PlusIcon data-icon="inline-start" />
                Criar quadro
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {boards.isSuccess && boards.data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {boards.data.map((board) => (
              <li key={board.id}>
                <BoardCard
                  board={board}
                  onEdit={() => setBoardToEdit(board)}
                  onDelete={() => setBoardToDelete(board)}
                />
              </li>
            ))}
          </ul>
        )}

        <BoardFormDialog
          open={isCreating}
          onOpenChange={setIsCreating}
          teamId={activeTeam?.id}
          onCreated={(board) => navigate(PATHS.board(board.id))}
        />

        <TeamFormDialog
          open={isCreatingTeam}
          onOpenChange={setIsCreatingTeam}
        />

        {boardToEdit && (
          <BoardFormDialog
            open
            onOpenChange={(open) => !open && setBoardToEdit(null)}
            board={boardToEdit}
          />
        )}

        {boardToDelete && (
          <DeleteBoardDialog
            open
            onOpenChange={(open) => !open && setBoardToDelete(null)}
            board={boardToDelete}
          />
        )}
      </div>
    </>
  )
}

interface BoardCardProps {
  board: BoardResponse
  onEdit: () => void
  onDelete: () => void
}

function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  return (
    <Card className="relative h-full border transition-colors hover:border-primary/50">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <DynamicIcon
            name={(board.icon ?? FALLBACK_ICON) as IconName}
            aria-hidden
            className="size-4 shrink-0"
          />
          <Link
            to={PATHS.board(board.id)}
            className="truncate after:absolute after:inset-0 after:content-['']"
          >
            {board.name}
          </Link>
        </CardTitle>

        <CardDescription className="line-clamp-2 min-h-8">
          {board.description || "Sem descrição."}
        </CardDescription>

        <CardAction className="relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label={`Ações do quadro ${board.name}`}
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onEdit}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2Icon />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="flex items-center gap-2">
        <UserAvatar user={board.owner} size="sm" />
        <span className="truncate text-xs text-muted-foreground">
          {board.owner.name}
        </span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(board.updatedAt)}
        </span>
      </CardContent>
    </Card>
  )
}

function BoardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
