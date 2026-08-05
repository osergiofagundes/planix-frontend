import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { BoardResponse } from "@/types/board.types"
import type {
  InviteCreatedResponse,
  InvitePreviewResponse,
  InviteRequest,
  InviteResponse,
} from "@/types/invite.types"

export const inviteService = {
  /** `403` para quem não é dono do quadro: só ele vê os convites. */
  async listByBoard(boardId: Id): Promise<InviteResponse[]> {
    const { data } = await api.get<InviteResponse[]>(
      API_ENDPOINTS.boards.invites(boardId)
    )
    return data
  },

  async create(
    boardId: Id,
    payload: InviteRequest
  ): Promise<InviteCreatedResponse> {
    const { data } = await api.post<InviteCreatedResponse>(
      API_ENDPOINTS.boards.invites(boardId),
      payload
    )
    return data
  },

  async revoke(inviteId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.invites.byId(inviteId))
  },

  async preview(token: string): Promise<InvitePreviewResponse> {
    const { data } = await api.post<InvitePreviewResponse>(
      API_ENDPOINTS.invites.preview,
      { token }
    )
    return data
  },

  async accept(token: string): Promise<BoardResponse> {
    const { data } = await api.post<BoardResponse>(
      API_ENDPOINTS.invites.accept,
      { token }
    )
    return data
  },
}
