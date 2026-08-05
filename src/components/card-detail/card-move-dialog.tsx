import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useMoveCard } from "@/hooks/use-cards"
import { useLists } from "@/hooks/use-lists"
import type { CardResponse } from "@/types/card.types"

interface CardMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardResponse
  boardId: string
}

export function CardMoveDialog({
  open,
  onOpenChange,
  card,
  boardId,
}: CardMoveDialogProps) {
  const lists = useLists(boardId)
  const moveCard = useMoveCard()

  const [targetListId, setTargetListId] = useState(String(card.listId))

  const listItems = (lists.data ?? []).map((list) => ({
    value: String(list.id),
    label: list.name,
  }))

  function submit() {
    const parsed = Number(targetListId)

    if (!Number.isFinite(parsed) || parsed === card.listId) {
      onOpenChange(false)
      return
    }

    moveCard.mutate(
      {
        cardId: card.id,
        sourceListId: card.listId,
        targetListId: parsed,
        toIndex: 0,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mover cartão</DialogTitle>
          <DialogDescription>
            Escolha a lista de destino. O cartão vai para o topo dela.
          </DialogDescription>
        </DialogHeader>

        <Select
          items={listItems}
          value={targetListId}
          onValueChange={(value) => setTargetListId(String(value))}
        >
          <SelectTrigger className="w-full" aria-label="Lista de destino">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {listItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button onClick={submit} disabled={moveCard.isPending}>
            {moveCard.isPending && <Spinner data-icon="inline-start" />}
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
