import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteList } from "@/hooks/use-lists"
import type { BoardListResponse } from "@/types/board.types"

interface BoardColumnMenuProps {
  boardId: string
  list: BoardListResponse
  cardCount: number
  onStartRename: () => void
}

export function BoardColumnMenu({
  boardId,
  list,
  cardCount,
  onStartRename,
}: BoardColumnMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteList = useDeleteList(boardId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label={`Ações da lista ${list.name}`}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onStartRename}>
              <PencilIcon />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2Icon />
              Excluir lista
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isDeleting && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setIsDeleting(false)}
          title={`Excluir "${list.name}"?`}
          description={
            cardCount > 0
              ? `Os ${cardCount} cartões desta lista serão apagados junto. Não há como desfazer.`
              : "A lista está vazia e será apagada. Não há como desfazer."
          }
          confirmLabel="Excluir lista"
          pendingLabel="Excluindo…"
          isPending={deleteList.isPending}
          onConfirm={() =>
            deleteList.mutate(list.id, {
              onSuccess: () => setIsDeleting(false),
            })
          }
        />
      )}
    </>
  )
}
