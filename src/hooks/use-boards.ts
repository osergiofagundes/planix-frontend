import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { boardService } from "@/services/board.service"
import type { BoardCreateRequest, BoardRequest } from "@/types/board.types"

/** Sem `teamId`, traz todos os quadros a que você tem acesso, em todas as equipes. */
export function useBoards(teamId?: number) {
  return useQuery({
    queryKey: teamId ? queryKeys.boards.byTeam(teamId) : queryKeys.boards.all,
    queryFn: () => boardService.list(teamId),
  })
}

export function useBoard(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId ?? ""),
    queryFn: () => boardService.getById(boardId!),
    enabled: Boolean(boardId),
  })
}

export function useBoardMembers(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boards.members(boardId ?? ""),
    queryFn: () => boardService.members(boardId!),
    enabled: Boolean(boardId),
  })
}

/** Membros da equipe que ainda não estão no quadro — só faz sentido em quadro fechado. */
export function useBoardMemberCandidates(
  boardId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.boards.memberCandidates(boardId ?? ""),
    queryFn: () => boardService.memberCandidates(boardId!),
    enabled: Boolean(boardId) && enabled,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardCreateRequest) => boardService.create(payload),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      toastSuccess("Quadro criado.", board.name)
    },
  })
}

export function useUpdateBoard(boardId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardRequest) =>
      boardService.update(boardId, payload),
    onSuccess: (board) => {
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      // Mudar a visibilidade muda quem está no quadro.
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.members(board.id),
      })
      toastSuccess("Quadro atualizado.")
    },
  })
}

export function useAddBoardMember(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => boardService.addMember(boardId, userId),
    onSuccess: (user) => {
      invalidateBoardMembers(queryClient, boardId)
      toastSuccess("Acesso liberado.", `${user.name} agora vê este quadro.`)
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível dar acesso ao quadro"),
  })
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => boardService.removeMember(boardId, userId),
    onSuccess: () => {
      invalidateBoardMembers(queryClient, boardId)
      queryClient.invalidateQueries({ queryKey: ["lists"] })
      toastSuccess("Membro removido.")
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível remover o membro"),
  })
}

export function useLeaveBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (boardId: string | number) => boardService.leave(boardId),
    onSuccess: (_data, boardId) => {
      queryClient.removeQueries({ queryKey: queryKeys.boards.detail(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Você saiu do quadro.")
    },
    onError: (error) => toastApiError(error, "Não foi possível sair do quadro"),
  })
}

export function useTransferOwner(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => boardService.transferOwner(boardId, userId),
    onSuccess: (board) => {
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Posse transferida.", `Agora o dono é ${board.owner.name}.`)
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível transferir a posse"),
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      boardId,
      confirmationName,
    }: {
      boardId: string | number
      confirmationName?: string
    }) => boardService.remove(boardId, confirmationName),
    onSuccess: (_data, { boardId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.boards.detail(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Quadro excluído.")
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível excluir o quadro"),
  })
}

function invalidateBoardMembers(
  queryClient: ReturnType<typeof useQueryClient>,
  boardId: string
): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.boards.members(boardId) })
  queryClient.invalidateQueries({
    queryKey: queryKeys.boards.memberCandidates(boardId),
  })
}
