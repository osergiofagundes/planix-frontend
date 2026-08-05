import { CARD_PRIORITIES } from "@/types/card.types"
import type { CardPriority, CardResponse } from "@/types/card.types"

export interface CardFilter {
  search: string
  assigneeIds: number[]
  labelIds: number[]
  priorities: CardPriority[]
  hideCompleted: boolean
}

export const EMPTY_CARD_FILTER: CardFilter = {
  search: "",
  assigneeIds: [],
  labelIds: [],
  priorities: [],
  hideCompleted: false,
}

export function isCardPriority(
  value: string | undefined
): value is CardPriority {
  return (
    value !== undefined && (CARD_PRIORITIES as readonly string[]).includes(value)
  )
}

export function countActiveFilters(filter: CardFilter): number {
  return (
    (filter.search.trim() ? 1 : 0) +
    filter.assigneeIds.length +
    filter.labelIds.length +
    filter.priorities.length +
    (filter.hideCompleted ? 1 : 0)
  )
}

export function isCardFilterActive(filter: CardFilter): boolean {
  return countActiveFilters(filter) > 0
}

export function matchesCardFilter(
  card: CardResponse,
  filter: CardFilter
): boolean {
  if (filter.hideCompleted && card.completed) {
    return false
  }

  const search = filter.search.trim().toLocaleLowerCase("pt-BR")

  if (search) {
    const haystack = `${card.title} ${card.description ?? ""}`.toLocaleLowerCase(
      "pt-BR"
    )

    if (!haystack.includes(search)) {
      return false
    }
  }

  if (
    filter.assigneeIds.length > 0 &&
    !card.assignees.some((user) => filter.assigneeIds.includes(user.id))
  ) {
    return false
  }

  if (
    filter.labelIds.length > 0 &&
    !card.labels.some((label) => filter.labelIds.includes(label.id))
  ) {
    return false
  }

  if (
    filter.priorities.length > 0 &&
    !filter.priorities.includes(card.priority)
  ) {
    return false
  }

  return true
}

export function filterCardsByList(
  cardsByList: Map<number, readonly CardResponse[]>,
  filter: CardFilter
): Map<number, readonly CardResponse[]> {
  if (!isCardFilterActive(filter)) {
    return cardsByList
  }

  const filtered = new Map<number, readonly CardResponse[]>()

  for (const [listId, cards] of cardsByList) {
    filtered.set(
      listId,
      cards.filter((card) => matchesCardFilter(card, filter))
    )
  }

  return filtered
}
