import { UserPlusIcon } from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useBoardMembers } from "@/hooks/use-boards"
import { useToggleCardAssignee } from "@/hooks/use-card"
import type { CardResponse } from "@/types/card.types"

interface CardAssigneesFieldProps {
  card: CardResponse
  boardId: string
}

export function CardAssigneesField({ card, boardId }: CardAssigneesFieldProps) {
  const members = useBoardMembers(boardId)
  const toggleAssignee = useToggleCardAssignee()

  const assignedIds = new Set(card.assignees.map((user) => user.id))

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        Responsáveis
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {card.assignees.map((assignee) => (
          <div key={assignee.id} className="flex items-center gap-1.5">
            <UserAvatar user={assignee} size="sm" showTooltip={false} />
            <span className="text-xs">{assignee.name}</span>
          </div>
        ))}

        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>
            <UserPlusIcon data-icon="inline-start" />
            {card.assignees.length === 0 ? "Atribuir" : "Editar"}
          </PopoverTrigger>

          <PopoverContent align="start" className="w-64">
            <div className="flex flex-col gap-1">
              <p className="px-1 pb-1 text-xs text-muted-foreground">
                Membros do quadro
              </p>

              {members.isPending && (
                <p className="px-1 text-xs text-muted-foreground">Carregando…</p>
              )}

              {members.isSuccess && members.data.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">
                  Nenhum membro para atribuir.
                </p>
              )}

              {members.data?.map((member) => {
                const assigned = assignedIds.has(member.id)

                return (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-2 p-1 hover:bg-accent"
                  >
                    <Checkbox
                      checked={assigned}
                      disabled={toggleAssignee.isPending}
                      onCheckedChange={() =>
                        toggleAssignee.mutate({
                          cardId: card.id,
                          userId: member.id,
                          assigned,
                        })
                      }
                    />
                    <UserAvatar user={member} size="sm" showTooltip={false} />
                    <span className="truncate text-xs">{member.name}</span>
                  </label>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
