import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { commentService } from "@/services/comment.service"
import type { CommentResponse } from "@/types/card.types"
import type { UserSummary } from "@/types/user.types"

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
    mutationFn: ({ text, parentId }: { text: string; parentId?: number }) =>
      commentService.create(cardId, { text, parentId: parentId ?? null }),
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
    onError: (error) =>
      toastApiError(error, "Não foi possível editar o comentário"),
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

/**
 * Otimista de propósito: esperar o servidor deixa um buraco visível entre o
 * clique e a pílula aparecer, e reação é o gesto mais barato da tela.
 */
export function useToggleCommentReaction(cardId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const queryKey = queryKeys.cards.comments(cardId)

  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: number; emoji: string }) =>
      commentService.toggleReaction(commentId, { emoji }),

    onMutate: async ({ commentId, emoji }) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<CommentResponse[]>(queryKey)

      if (previous && user) {
        const me: UserSummary = { id: user.id, name: user.name }

        queryClient.setQueryData<CommentResponse[]>(
          queryKey,
          previous.map((root) => ({
            ...toggleIn(root, commentId, emoji, me),
            replies: root.replies.map((reply) =>
              toggleIn(reply, commentId, emoji, me)
            ),
          }))
        )
      }

      return { previous }
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      toastApiError(error, "Não foi possível reagir ao comentário")
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

function toggleIn(
  comment: CommentResponse,
  commentId: number,
  emoji: string,
  user: UserSummary
): CommentResponse {
  if (comment.id !== commentId) {
    return comment
  }

  const current = comment.reactions.find((reaction) => reaction.emoji === emoji)

  if (!current) {
    return {
      ...comment,
      reactions: [
        ...comment.reactions,
        { emoji, count: 1, reactedByMe: true, users: [user] },
      ],
    }
  }

  if (!current.reactedByMe) {
    return {
      ...comment,
      reactions: comment.reactions.map((reaction) =>
        reaction.emoji === emoji
          ? {
              ...reaction,
              count: reaction.count + 1,
              reactedByMe: true,
              users: [...reaction.users, user],
            }
          : reaction
      ),
    }
  }

  if (current.count === 1) {
    return {
      ...comment,
      reactions: comment.reactions.filter(
        (reaction) => reaction.emoji !== emoji
      ),
    }
  }

  return {
    ...comment,
    reactions: comment.reactions.map((reaction) =>
      reaction.emoji === emoji
        ? {
            ...reaction,
            count: reaction.count - 1,
            reactedByMe: false,
            users: reaction.users.filter((who) => who.id !== user.id),
          }
        : reaction
    ),
  }
}
