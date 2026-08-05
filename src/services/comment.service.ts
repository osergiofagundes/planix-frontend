import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { CommentRequest, CommentResponse } from "@/types/card.types"

export const commentService = {
  async listByCard(cardId: Id): Promise<CommentResponse[]> {
    const { data } = await api.get<CommentResponse[]>(
      API_ENDPOINTS.cards.comments(cardId)
    )
    return data
  },

  async create(cardId: Id, payload: CommentRequest): Promise<CommentResponse> {
    const { data } = await api.post<CommentResponse>(
      API_ENDPOINTS.cards.comments(cardId),
      payload
    )
    return data
  },

  async update(
    commentId: Id,
    payload: CommentRequest
  ): Promise<CommentResponse> {
    const { data } = await api.put<CommentResponse>(
      API_ENDPOINTS.comments.byId(commentId),
      payload
    )
    return data
  },

  async remove(commentId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.comments.byId(commentId))
  },
}
