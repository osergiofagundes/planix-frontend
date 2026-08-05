import { useState } from "react"
import { Link } from "react-router-dom"
import { SettingsIcon, UserPlusIcon } from "lucide-react"

import { BoardFilterPopover } from "@/components/board/board-filter-popover"
import { InviteDialog } from "@/components/board/invite-dialog"
import { UserAvatar } from "@/components/user-avatar"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"
import type { UserSummary } from "@/types/user.types"

const VISIBLE_MEMBERS = 4

interface BoardHeaderProps {
  board: BoardResponse
  members: UserSummary[]
}

export function BoardHeader({ board, members }: BoardHeaderProps) {
  const { user } = useAuth()
  const [isInviting, setIsInviting] = useState(false)

  const visible = members.slice(0, VISIBLE_MEMBERS)
  const hidden = members.length - visible.length

  const isOwner = user?.id === board.owner.id

  return (
    <>
      <h1 className="min-w-0 truncate font-heading text-base font-medium">
        {board.name}
      </h1>

      <div className="flex-1" />

      <BoardFilterPopover boardId={String(board.id)} members={members} />

      {isOwner && (
        <>
          <Button variant="outline" size="sm" onClick={() => setIsInviting(true)}>
            <UserPlusIcon data-icon="inline-start" />
            <span className="max-sm:sr-only">Convidar</span>
          </Button>

          <InviteDialog
            boardId={String(board.id)}
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
