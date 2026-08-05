import { useRef } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { BoardCard } from "@/components/board/board-card"
import { DRAG_ACTIVATION_DISTANCE, dragIdFor } from "@/lib/drag"
import { cn } from "@/lib/utils"
import type { CardResponse } from "@/types/card.types"

interface SortableBoardCardProps {
  card: CardResponse
  boardId: string
}

export function SortableBoardCard({ card, boardId }: SortableBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dragIdFor.card(card.id),
    data: { type: "card", card },
  })

  const pointerDownAt = useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("touch-none", isDragging && "opacity-40")}
      onPointerDown={(event) => {
        pointerDownAt.current = { x: event.clientX, y: event.clientY }
      }}
      onClickCapture={(event) => {
        const start = pointerDownAt.current

        if (!start) {
          return
        }

        const distance = Math.hypot(
          event.clientX - start.x,
          event.clientY - start.y
        )

        if (distance > DRAG_ACTIVATION_DISTANCE) {
          event.preventDefault()
          event.stopPropagation()
        }

        pointerDownAt.current = null
      }}
      {...attributes}
      {...listeners}
    >
      <BoardCard card={card} boardId={boardId} />
    </div>
  )
}
