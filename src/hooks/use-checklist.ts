import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { moveWithin } from "@/lib/reorder"
import { checklistService } from "@/services/checklist.service"
import type { ChecklistItemResponse } from "@/types/card.types"

export function useChecklist(cardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.checklist(cardId ?? ""),
    queryFn: () => checklistService.listByCard(cardId!),
    enabled: Boolean(cardId),
  })
}

export function useCreateChecklistItem(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => checklistService.create(cardId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.checklist(cardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível adicionar o item"),
  })
}

export function useUpdateChecklistItem(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, text }: { itemId: number; text: string }) =>
      checklistService.update(itemId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.checklist(cardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível salvar o item"),
  })
}

export function useDeleteChecklistItem(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => checklistService.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.checklist(cardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível excluir o item"),
  })
}

export function useToggleChecklistItem(cardId: string) {
  const queryClient = useQueryClient()
  const checklistKey = queryKeys.cards.checklist(cardId)

  return useMutation({
    mutationFn: (itemId: number) => checklistService.toggle(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: checklistKey })

      const snapshot =
        queryClient.getQueryData<ChecklistItemResponse[]>(checklistKey) ?? []

      queryClient.setQueryData(
        checklistKey,
        snapshot.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        )
      )

      return { snapshot }
    },

    onError: (error, _itemId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(checklistKey, context.snapshot)
      }

      toastApiError(error, "Não foi possível marcar o item")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKey })
    },
  })
}

export function useMoveChecklistItem(cardId: string) {
  const queryClient = useQueryClient()
  const checklistKey = queryKeys.cards.checklist(cardId)

  return useMutation({
    mutationFn: ({ itemId, toIndex }: { itemId: number; toIndex: number }) =>
      checklistService.move(itemId, { position: toIndex }),

    onMutate: async ({ itemId, toIndex }) => {
      await queryClient.cancelQueries({ queryKey: checklistKey })

      const snapshot =
        queryClient.getQueryData<ChecklistItemResponse[]>(checklistKey) ?? []
      const fromIndex = snapshot.findIndex((item) => item.id === itemId)

      queryClient.setQueryData(
        checklistKey,
        moveWithin(snapshot, fromIndex, toIndex)
      )

      return { snapshot }
    },

    onError: (error, _variables, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(checklistKey, context.snapshot)
      }

      toastApiError(error, "Não foi possível reordenar a checklist")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKey })
    },
  })
}
