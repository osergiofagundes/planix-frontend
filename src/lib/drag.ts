import type { BoardListResponse } from "@/types/board.types"
import type { CardResponse } from "@/types/card.types"

export const DRAG_ACTIVATION_DISTANCE = 8

export const dragIdFor = {
  card: (cardId: number) => `card-${cardId}`,
  list: (listId: number) => `list-${listId}`,
  column: (listId: number) => `column-${listId}`,
}

export type DragData =
  | { type: "card"; card: CardResponse }
  | { type: "list"; list: BoardListResponse }
  | { type: "column"; listId: number }

export function readDragData(
  data: Record<string, unknown> | undefined
): DragData | null {
  if (!data || typeof data.type !== "string") {
    return null
  }

  if (data.type === "card" || data.type === "list" || data.type === "column") {
    return data as unknown as DragData
  }

  return null
}
