import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { labelService } from "@/services/label.service"
import type { LabelRequest } from "@/types/board.types"

export function useBoardLabels(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boards.labels(boardId ?? ""),
    queryFn: () => labelService.listByBoard(boardId!),
    enabled: Boolean(boardId),
  })
}

export function useCreateLabel(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LabelRequest) => labelService.create(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.labels(boardId) })
    },
  })
}

export function useUpdateLabel(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ labelId, ...payload }: LabelRequest & { labelId: number }) =>
      labelService.update(labelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.labels(boardId) })
      queryClient.invalidateQueries({ queryKey: ["lists"] })
    },
  })
}

export function useDeleteLabel(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (labelId: number) => labelService.remove(labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.labels(boardId) })
      queryClient.invalidateQueries({ queryKey: ["lists"] })
    },
    onError: (error) => toastApiError(error, "Não foi possível excluir a etiqueta"),
  })
}
