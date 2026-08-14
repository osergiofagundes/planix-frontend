import { useState } from "react"
import { Link } from "react-router-dom"
import { SettingsIcon, UserPlusIcon } from "lucide-react"
import type { IconName } from "lucide-react/dynamic"

import { BoardFilterPopover } from "@/components/board/board-filter-popover"
import {
  TopbarTitle,
  type TopbarTitleSegment,
} from "@/components/layout/topbar-title"
import { TeamInviteDialog } from "@/components/team/team-invite-dialog"
import { UserAvatar } from "@/components/common/user-avatar"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useActiveTeam } from "@/hooks/use-active-team"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"
import { isTeamAdmin } from "@/types/team.types"
import type { UserSummary } from "@/types/user.types"

const VISIBLE_MEMBERS = 4
const FALLBACK_ICON = "square-kanban" as IconName
const TEAM_FALLBACK_ICON = "building-2" as IconName

interface BoardHeaderProps {
  board: BoardResponse
  members: UserSummary[]
}

export function BoardHeader({ board, members }: BoardHeaderProps) {
  const { teams } = useActiveTeam()
  const [isInviting, setIsInviting] = useState(false)

  const visible = members.slice(0, VISIBLE_MEMBERS)
  const hidden = members.length - visible.length

  const team = teams.find((item) => item.id === board.teamId)

  // Convidar traz gente para a equipe do quadro — quem administra a equipe pode.
  const canInvite = isTeamAdmin(team?.myRole)

  const titleSegments: TopbarTitleSegment[] = [
    ...(team
      ? [
          {
            icon: (team.icon ?? TEAM_FALLBACK_ICON) as IconName,
            label: team.name,
            hideOnMobile: true,
          },
        ]
      : []),
    {
      icon: (board.icon ?? FALLBACK_ICON) as IconName,
      label: board.name,
    },
  ]

  return (
    <>
      <TopbarTitle segments={titleSegments} />

      <BoardFilterPopover boardId={String(board.id)} members={members} />

      {canInvite && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviting(true)}
          >
            <UserPlusIcon data-icon="inline-start" />
            <span className="max-sm:sr-only">Convidar</span>
          </Button>

          <TeamInviteDialog
            teamId={board.teamId}
            open={isInviting}
            onOpenChange={setIsInviting}
          />
        </>
      )}

      {visible.length > 0 && (
        <AvatarGroup className="max-sm:hidden">
          {visible.map((member) => (
            <UserAvatar key={member.id} user={member} size="sm" />
          ))}
          {hidden > 0 && (
            <AvatarGroupCount className="size-6 text-xs">
              +{hidden}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
      )}

      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              to={PATHS.boardSettings(board.id)}
              aria-label="Configurações do quadro"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            />
          }
        >
          <SettingsIcon />
        </TooltipTrigger>
        <TooltipContent>Configurações do quadro</TooltipContent>
      </Tooltip>
    </>
  )
}
