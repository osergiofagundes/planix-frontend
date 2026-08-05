import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { inviteService } from "@/services/invite.service"
import type { InviteRequest } from "@/types/invite.types"

export function useBoardInvites(boardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.boards.invites(boardId ?? ""),
    queryFn: () => inviteService.listByBoard(boardId!),
    enabled: Boolean(boardId) && enabled,
  })
}

export function useCreateInvite(boardId: string) {
  return useMutation({
    mutationFn: (payload: InviteRequest) =>
      inviteService.create(boardId, payload),
    onError: (error) => toastApiError(error, "Não foi possível gerar o convite"),
  })
}

export function useRevokeInvite(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => inviteService.revoke(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.invites(boardId),
      })
      toastSuccess("Convite revogado.", "O convite não será mais aceito.")
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível revogar o convite"),
  })
}

export function useInvitePreview() {
  return useMutation({
    mutationFn: (token: string) => inviteService.preview(token),
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => inviteService.accept(token),
    onSuccess: (board) => {
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Você entrou no quadro.", board.name)
    },
    onError: (error) => toastApiError(error, "Não foi possível aceitar o convite"),
  })
}
