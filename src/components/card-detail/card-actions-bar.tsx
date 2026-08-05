import { useState } from "react"
import {
  CircleCheckIcon,
  LinkIcon,
  MoveRightIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { CardMoveDialog } from "@/components/card-detail/card-move-dialog"
import { Button } from "@/components/ui/button"
import { useToggleCardComplete } from "@/hooks/use-card"
import { useDeleteCard } from "@/hooks/use-cards"
import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { PATHS } from "@/routes/paths"
import type { CardResponse } from "@/types/card.types"

interface CardActionsBarProps {
  card: CardResponse
  boardId: string
  onDeleted: () => void
}

export function CardActionsBar({
  card,
  boardId,
  onDeleted,
}: CardActionsBarProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleComplete = useToggleCardComplete()
  const deleteCard = useDeleteCard()

  async function copyLink() {
    const url = new URL(PATHS.card(boardId, card.id), window.location.origin)

    try {
      await navigator.clipboard.writeText(url.toString())
      toastSuccess("Link copiado.")
    } catch (error) {
      toastApiError(error, "Não foi possível copiar o link")
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={toggleComplete.isPending}
        onClick={() =>
          toggleComplete.mutate({
            cardId: card.id,
            completed: !card.completed,
          })
        }
      >
        {card.completed ? (
          <RotateCcwIcon data-icon="inline-start" />
        ) : (
          <CircleCheckIcon data-icon="inline-start" />
        )}
        {card.completed ? "Reabrir cartão" : "Marcar como concluído"}
      </Button>

      <Button variant="outline" size="sm" onClick={() => setIsMoving(true)}>
        <MoveRightIcon data-icon="inline-start" />
        Mover
      </Button>

      <Button variant="outline" size="sm" onClick={copyLink}>
        <LinkIcon data-icon="inline-start" />
        Copiar link
      </Button>

      <Button
        variant="destructive"
        size="sm"
        className="ms-auto"
        onClick={() => setIsDeleting(true)}
      >
        <Trash2Icon data-icon="inline-start" />
        Excluir cartão
      </Button>

      {isMoving && (
        <CardMoveDialog
          open
          onOpenChange={(open) => !open && setIsMoving(false)}
          card={card}
          boardId={boardId}
        />
      )}

      {isDeleting && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setIsDeleting(false)}
          title={`Excluir "${card.title}"?`}
          description="A checklist, os comentários, os links e os anexos deste cartão são apagados junto. Não há como desfazer."
          confirmLabel="Excluir cartão"
          pendingLabel="Excluindo…"
          isPending={deleteCard.isPending}
          onConfirm={() =>
            deleteCard.mutate(
              { cardId: card.id, listId: card.listId },
              { onSuccess: onDeleted }
            )
          }
        />
      )}
    </>
  )
}
