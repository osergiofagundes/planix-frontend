import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { removeCardFromCaches } from "@/lib/card-cache"
import { queryKeys } from "@/lib/query-client"
import { moveBetween, moveWithin } from "@/lib/reorder"
import { cardService } from "@/services/card.service"
import type { BoardListResponse } from "@/types/board.types"
import type { CardResponse } from "@/types/card.types"

const EMPTY_CARDS: readonly CardResponse[] = []

export function useBoardCards(lists: BoardListResponse[] | undefined) {
  const results = useQueries({
    queries: (lists ?? []).map((list) => ({
      queryKey: queryKeys.lists.cards(list.id),
      queryFn: () => cardService.listByList(list.id),
    })),
  })

  const cardsByList = new Map<number, readonly CardResponse[]>()

  ;(lists ?? []).forEach((list, index) => {
    cardsByList.set(list.id, results[index]?.data ?? EMPTY_CARDS)
  })

  return {
    cardsByList,
    isLoading: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
  }
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, title }: { listId: number; title: string }) =>
      cardService.create(listId, { title }),
    onSuccess: (_card, { listId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.cards(listId) })
    },
    onError: (error) => toastApiError(error, "Não foi possível criar o cartão"),
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId }: { cardId: number; listId: number }) =>
      cardService.remove(cardId),
    onSuccess: (_data, { cardId, listId }) => {
      removeCardFromCaches(queryClient, cardId, listId)
      queryClient.invalidateQueries({ queryKey: queryKeys.lists.cards(listId) })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível excluir o cartão"),
  })
}

export interface MoveCardVariables {
  cardId: number
  sourceListId: number
  targetListId: number
  toIndex: number
}

export function useMoveCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, targetListId, toIndex }: MoveCardVariables) =>
      cardService.move(cardId, { targetListId, position: toIndex }),

    onMutate: async ({ cardId, sourceListId, targetListId, toIndex }) => {
      const sourceKey = queryKeys.lists.cards(sourceListId)
      const targetKey = queryKeys.lists.cards(targetListId)

      await queryClient.cancelQueries({ queryKey: sourceKey })
      await queryClient.cancelQueries({ queryKey: targetKey })

      const sourceSnapshot =
        queryClient.getQueryData<CardResponse[]>(sourceKey) ?? []
      const targetSnapshot =
        queryClient.getQueryData<CardResponse[]>(targetKey) ?? []

      const fromIndex = sourceSnapshot.findIndex((card) => card.id === cardId)

      if (sourceListId === targetListId) {
        queryClient.setQueryData(
          sourceKey,
          moveWithin(sourceSnapshot, fromIndex, toIndex)
        )
      } else {
        const moved = moveBetween(
          sourceSnapshot,
          targetSnapshot,
          fromIndex,
          toIndex
        )

        queryClient.setQueryData(sourceKey, moved.source)
        queryClient.setQueryData(
          targetKey,
          moved.target.map((card) =>
            card.id === cardId ? { ...card, listId: targetListId } : card
          )
        )
      }

      return { sourceSnapshot, targetSnapshot }
    },

    onError: (error, { sourceListId, targetListId }, context) => {
      if (context) {
        queryClient.setQueryData(
          queryKeys.lists.cards(sourceListId),
          context.sourceSnapshot
        )
        queryClient.setQueryData(
          queryKeys.lists.cards(targetListId),
          context.targetSnapshot
        )
      }

      toastApiError(error, "Não foi possível mover o cartão")
    },

    onSettled: (_data, _error, { cardId, sourceListId, targetListId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lists.cards(sourceListId),
      })

      if (targetListId !== sourceListId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.lists.cards(targetListId),
        })
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.detail(cardId),
      })
    },
  })
}
