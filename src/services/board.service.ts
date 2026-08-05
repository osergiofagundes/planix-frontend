import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { BoardRequest, BoardResponse } from "@/types/board.types"
import type { UserSummary } from "@/types/user.types"

export const boardService = {
  async list(): Promise<BoardResponse[]> {
    const { data } = await api.get<BoardResponse[]>(API_ENDPOINTS.boards.root)
    return data
  },

  async getById(boardId: Id): Promise<BoardResponse> {
    const { data } = await api.get<BoardResponse>(
      API_ENDPOINTS.boards.byId(boardId)
    )
    return data
  },

  async create(payload: BoardRequest): Promise<BoardResponse> {
    const { data } = await api.post<BoardResponse>(
      API_ENDPOINTS.boards.root,
      payload
    )
    return data
  },

  async update(boardId: Id, payload: BoardRequest): Promise<BoardResponse> {
    const { data } = await api.put<BoardResponse>(
      API_ENDPOINTS.boards.byId(boardId),
      payload
    )
    return data
  },

  async remove(boardId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.boards.byId(boardId))
  },

  async members(boardId: Id): Promise<UserSummary[]> {
    const { data } = await api.get<UserSummary[]>(
      API_ENDPOINTS.boards.members(boardId)
    )
    return data
  },

  async removeMember(boardId: Id, userId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.boards.member(boardId, userId))
  },

  async leave(boardId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.boards.leave(boardId))
  },

  async transferOwner(boardId: Id, userId: number): Promise<BoardResponse> {
    const { data } = await api.patch<BoardResponse>(
      API_ENDPOINTS.boards.owner(boardId),
      { userId }
    )
    return data
  },
}
