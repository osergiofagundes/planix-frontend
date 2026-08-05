import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { LabelRequest, LabelResponse } from "@/types/board.types"

export const labelService = {
  async listByBoard(boardId: Id): Promise<LabelResponse[]> {
    const { data } = await api.get<LabelResponse[]>(
      API_ENDPOINTS.boards.labels(boardId)
    )
    return data
  },

  async create(boardId: Id, payload: LabelRequest): Promise<LabelResponse> {
    const { data } = await api.post<LabelResponse>(
      API_ENDPOINTS.boards.labels(boardId),
      payload
    )
    return data
  },

  async update(labelId: Id, payload: LabelRequest): Promise<LabelResponse> {
    const { data } = await api.put<LabelResponse>(
      API_ENDPOINTS.labels.byId(labelId),
      payload
    )
    return data
  },

  async remove(labelId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.labels.byId(labelId))
  },
}
