import type { QueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-client"
import type { CardResponse } from "@/types/card.types"

export function writeCardToCaches(
  queryClient: QueryClient,
  card: CardResponse
): void {
  queryClient.setQueryData(queryKeys.cards.detail(card.id), card)

  queryClient.setQueryData<CardResponse[]>(
    queryKeys.lists.cards(card.listId),
    (current) =>
      current?.map((item) => (item.id === card.id ? card : item)) ?? current
  )
}

export function removeCardFromCaches(
  queryClient: QueryClient,
  cardId: number,
  listId: number
): void {
  queryClient.setQueryData<CardResponse[]>(
    queryKeys.lists.cards(listId),
    (current) => current?.filter((item) => item.id !== cardId) ?? current
  )

  queryClient.removeQueries({ queryKey: queryKeys.cards.detail(cardId) })
}
