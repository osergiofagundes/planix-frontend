import { useState } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDeleteBoard } from "@/hooks/use-boards"
import type { BoardResponse } from "@/types/board.types"

interface DeleteBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  board: BoardResponse
  onDeleted?: () => void
}

export function DeleteBoardDialog({
  open,
  onOpenChange,
  board,
  onDeleted,
}: DeleteBoardDialogProps) {
  const [confirmation, setConfirmation] = useState("")
  const deleteBoard = useDeleteBoard()

  const matchesName = confirmation.trim() === board.name.trim()

  function handleConfirm() {
    deleteBoard.mutate(board.id, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.()
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Excluir "${board.name}"?`}
      description="Isso apaga as listas, os cartões, os comentários e os anexos deste quadro. Os membros perdem o acesso na hora. Não há como desfazer."
      confirmLabel="Excluir quadro"
      pendingLabel="Excluindo…"
      isPending={deleteBoard.isPending}
      canConfirm={matchesName}
      onConfirm={handleConfirm}
    >
      <Field>
        <FieldLabel htmlFor="confirm-board-name" required>
          Para confirmar, digite o nome exato do quadro
        </FieldLabel>
        <Input
          id="confirm-board-name"
          autoComplete="off"
          placeholder={board.name}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </Field>
    </ConfirmDialog>
  )
}
