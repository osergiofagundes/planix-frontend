import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { moveWithin } from "@/lib/reorder"
import { listService } from "@/services/list.service"
import type { BoardListResponse } from "@/types/board.types"

export function useLists(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boards.lists(boardId ?? ""),
    queryFn: () => listService.listByBoard(boardId!),
    enabled: Boolean(boardId),
  })
}

export function useCreateList(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => listService.create(boardId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.lists(boardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível criar a lista"),
  })
}

export function useUpdateList(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, name }: { listId: number; name: string }) =>
      listService.update(listId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.lists(boardId),
      })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível renomear a lista"),
  })
}

export function useDeleteList(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listId: number) => listService.remove(listId),
    onSuccess: (_data, listId) => {
      queryClient.removeQueries({ queryKey: queryKeys.lists.cards(listId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.lists(boardId),
      })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível excluir a lista"),
  })
}

interface MoveListVariables {
  listId: number
  toIndex: number
}

export function useMoveList(boardId: string) {
  const queryClient = useQueryClient()
  const listsKey = queryKeys.boards.lists(boardId)

  return useMutation({
    mutationFn: ({ listId, toIndex }: MoveListVariables) =>
      listService.move(listId, { position: toIndex }),

    onMutate: async ({ listId, toIndex }) => {
      await queryClient.cancelQueries({ queryKey: listsKey })

      const snapshot =
        queryClient.getQueryData<BoardListResponse[]>(listsKey) ?? []
      const fromIndex = snapshot.findIndex((list) => list.id === listId)

      queryClient.setQueryData(
        listsKey,
        moveWithin(snapshot, fromIndex, toIndex)
      )

      return { snapshot }
    },

    onError: (error, _variables, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(listsKey, context.snapshot)
      }

      toastApiError(error, "Não foi possível mover a lista")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listsKey })
    },
  })
}
