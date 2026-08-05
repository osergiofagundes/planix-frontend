import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  BoardListRequest,
  BoardListResponse,
  MoveRequest,
} from "@/types/board.types"

export const listService = {
  async listByBoard(boardId: Id): Promise<BoardListResponse[]> {
    const { data } = await api.get<BoardListResponse[]>(
      API_ENDPOINTS.boards.lists(boardId)
    )
    return data
  },

  async create(
    boardId: Id,
    payload: BoardListRequest
  ): Promise<BoardListResponse> {
    const { data } = await api.post<BoardListResponse>(
      API_ENDPOINTS.boards.lists(boardId),
      payload
    )
    return data
  },

  async update(
    listId: Id,
    payload: BoardListRequest
  ): Promise<BoardListResponse> {
    const { data } = await api.put<BoardListResponse>(
      API_ENDPOINTS.lists.byId(listId),
      payload
    )
    return data
  },

  async remove(listId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.lists.byId(listId))
  },

  async move(listId: Id, payload: MoveRequest): Promise<void> {
    await api.patch(API_ENDPOINTS.lists.move(listId), payload)
  },
}
