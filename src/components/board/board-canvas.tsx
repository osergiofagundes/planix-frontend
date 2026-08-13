import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

import { BoardCard } from "@/components/board/board-card"
import { BoardColumn } from "@/components/board/board-column"
import { ListComposer } from "@/components/board/list-composer"
import { useMoveCard } from "@/hooks/use-cards"
import { useMoveList } from "@/hooks/use-lists"
import { DRAG_ACTIVATION_DISTANCE, dragIdFor, readDragData } from "@/lib/drag"
import type { BoardListResponse } from "@/types/board.types"
import type { CardResponse } from "@/types/card.types"

interface BoardCanvasProps {
  boardId: string
  lists: BoardListResponse[]
  cardsByList: Map<number, readonly CardResponse[]>
  allCardsByList: Map<number, readonly CardResponse[]>
  isLoadingCards: boolean
  isFiltered: boolean
}

export function BoardCanvas({
  boardId,
  lists,
  cardsByList,
  allCardsByList,
  isLoadingCards,
  isFiltered,
}: BoardCanvasProps) {
  const [activeCard, setActiveCard] = useState<CardResponse | null>(null)

  const moveCard = useMoveCard()
  const moveList = useMoveList(boardId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const data = readDragData(event.active.data.current)

    if (data?.type === "card") {
      setActiveCard(data.card)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)

    const { active, over } = event

    if (!over) {
      return
    }

    const activeData = readDragData(active.data.current)
    const overData = readDragData(over.data.current)

    if (!activeData || !overData) {
      return
    }

    if (activeData.type === "list") {
      handleListDrop(activeData.list, overData)
      return
    }

    if (activeData.type === "card") {
      handleCardDrop(activeData.card, overData)
    }
  }

  function handleListDrop(
    list: BoardListResponse,
    overData: ReturnType<typeof readDragData>
  ) {
    if (overData?.type !== "list") {
      return
    }

    const fromIndex = lists.findIndex((item) => item.id === list.id)
    const toIndex = lists.findIndex((item) => item.id === overData.list.id)

    if (fromIndex === toIndex || toIndex < 0) {
      return
    }

    moveList.mutate({ listId: list.id, toIndex })
  }

  function handleCardDrop(
    card: CardResponse,
    overData: ReturnType<typeof readDragData>
  ) {
    const sourceListId = card.listId

    let targetListId: number
    let toIndex: number

    if (overData?.type === "card") {
      targetListId = overData.card.listId
      toIndex = (allCardsByList.get(targetListId) ?? []).findIndex(
        (item) => item.id === overData.card.id
      )
    } else if (overData?.type === "column" || overData?.type === "list") {
      targetListId =
        overData.type === "column" ? overData.listId : overData.list.id
      const targetCards = allCardsByList.get(targetListId) ?? []
      toIndex =
        targetListId === sourceListId
          ? Math.max(targetCards.length - 1, 0)
          : targetCards.length
    } else {
      return
    }

    if (toIndex < 0) {
      return
    }

    if (targetListId === sourceListId && toIndex === card.position) {
      return
    }

    moveCard.mutate({ cardId: card.id, sourceListId, targetListId, toIndex })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCard(null)}
    >
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <SortableContext
          items={lists.map((list) => dragIdFor.list(list.id))}
          strategy={horizontalListSortingStrategy}
        >
          {lists.map((list) => (
            <BoardColumn
              key={list.id}
              boardId={boardId}
              list={list}
              cards={cardsByList.get(list.id) ?? []}
              totalCards={(allCardsByList.get(list.id) ?? []).length}
              isLoadingCards={isLoadingCards}
              isFiltered={isFiltered}
            />
          ))}
        </SortableContext>

        <ListComposer boardId={boardId} />
      </div>

      <DragOverlay>
        {activeCard && (
          <BoardCard card={activeCard} boardId={boardId} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}
