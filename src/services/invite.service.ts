import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  InviteCreatedResponse,
  InvitePreviewResponse,
  InviteRequest,
  InviteResponse,
} from "@/types/invite.types"
import type { TeamResponse } from "@/types/team.types"

export const inviteService = {
  async listByTeam(teamId: Id): Promise<InviteResponse[]> {
    const { data } = await api.get<InviteResponse[]>(
      API_ENDPOINTS.teams.invites(teamId)
    )
    return data
  },

  async create(
    teamId: Id,
    payload: InviteRequest
  ): Promise<InviteCreatedResponse> {
    const { data } = await api.post<InviteCreatedResponse>(
      API_ENDPOINTS.teams.invites(teamId),
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

  async accept(token: string): Promise<TeamResponse> {
    const { data } = await api.post<TeamResponse>(
      API_ENDPOINTS.invites.accept,
      { token }
    )
    return data
  },
}
