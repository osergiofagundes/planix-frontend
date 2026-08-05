import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { boardService } from "@/services/board.service"
import type { BoardRequest } from "@/types/board.types"

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards.all,
    queryFn: boardService.list,
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

export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardRequest) => boardService.create(payload),
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
    mutationFn: (payload: BoardRequest) => boardService.update(boardId, payload),
    onSuccess: (board) => {
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Quadro atualizado.")
    },
  })
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => boardService.removeMember(boardId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.members(boardId),
      })
      queryClient.invalidateQueries({ queryKey: ["lists"] })
      toastSuccess("Membro removido.")
    },
    onError: (error) => toastApiError(error, "Não foi possível remover o membro"),
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
    mutationFn: (boardId: string | number) => boardService.remove(boardId),
    onSuccess: (_data, boardId) => {
      queryClient.removeQueries({ queryKey: queryKeys.boards.detail(boardId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Quadro excluído.")
    },
    onError: (error) => toastApiError(error, "Não foi possível excluir o quadro"),
  })
}
