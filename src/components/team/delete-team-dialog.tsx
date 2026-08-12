import { useState } from "react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDeleteTeam } from "@/hooks/use-teams"
import type { TeamResponse } from "@/types/team.types"

interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: TeamResponse
  onDeleted?: () => void
}

export function DeleteTeamDialog({
  open,
  onOpenChange,
  team,
  onDeleted,
}: DeleteTeamDialogProps) {
  const [confirmation, setConfirmation] = useState("")
  const deleteTeam = useDeleteTeam()

  const matchesName = confirmation.trim() === team.name.trim()

  function handleConfirm() {
    deleteTeam.mutate(
      { teamId: team.id, confirmationName: team.name },
      {
        onSuccess: () => {
          onOpenChange(false)
          onDeleted?.()
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Excluir "${team.name}"?`}
      description="Isso apaga todos os quadros da equipe, com listas, cartões, comentários e anexos. Todo mundo perde o acesso na hora. Não há como desfazer."
      confirmLabel="Excluir equipe"
      pendingLabel="Excluindo…"
      isPending={deleteTeam.isPending}
      canConfirm={matchesName}
      onConfirm={handleConfirm}
    >
      <Field>
        <FieldLabel htmlFor="confirm-team-name" required>
          Para confirmar, digite o nome exato da equipe
        </FieldLabel>
        <Input
          id="confirm-team-name"
          autoComplete="off"
          placeholder={team.name}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </Field>
    </ConfirmDialog>
  )
}
