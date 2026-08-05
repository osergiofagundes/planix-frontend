import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { commentService } from "@/services/comment.service"

export function useComments(cardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.comments(cardId ?? ""),
    queryFn: () => commentService.listByCard(cardId!),
    enabled: Boolean(cardId),
  })
}

export function useCreateComment(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => commentService.create(cardId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.comments(cardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível comentar"),
  })
}

export function useUpdateComment(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: number; text: string }) =>
      commentService.update(commentId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.comments(cardId),
      })
    },
    onError: (error) => toastApiError(error, "Não foi possível editar o comentário"),
  })
}

export function useDeleteComment(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => commentService.remove(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.comments(cardId),
      })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível excluir o comentário"),
  })
}
