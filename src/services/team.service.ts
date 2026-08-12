import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  RoleChangeRequest,
  TeamMemberResponse,
  TeamRequest,
  TeamResponse,
} from "@/types/team.types"

export const teamService = {
  async list(): Promise<TeamResponse[]> {
    const { data } = await api.get<TeamResponse[]>(API_ENDPOINTS.teams.root)
    return data
  },

  async getById(teamId: Id): Promise<TeamResponse> {
    const { data } = await api.get<TeamResponse>(
      API_ENDPOINTS.teams.byId(teamId)
    )
    return data
  },

  async create(payload: TeamRequest): Promise<TeamResponse> {
    const { data } = await api.post<TeamResponse>(
      API_ENDPOINTS.teams.root,
      payload
    )
    return data
  },

  async update(teamId: Id, payload: TeamRequest): Promise<TeamResponse> {
    const { data } = await api.put<TeamResponse>(
      API_ENDPOINTS.teams.byId(teamId),
      payload
    )
    return data
  },

  async remove(teamId: Id, confirmationName?: string): Promise<void> {
    await api.delete(API_ENDPOINTS.teams.byId(teamId), {
      params: confirmationName ? { confirmationName } : undefined,
    })
  },

  async members(teamId: Id): Promise<TeamMemberResponse[]> {
    const { data } = await api.get<TeamMemberResponse[]>(
      API_ENDPOINTS.teams.members(teamId)
    )
    return data
  },

  async changeRole(
    teamId: Id,
    userId: Id,
    payload: RoleChangeRequest
  ): Promise<TeamMemberResponse> {
    const { data } = await api.patch<TeamMemberResponse>(
      API_ENDPOINTS.teams.member(teamId, userId),
      payload
    )
    return data
  },

  async removeMember(teamId: Id, userId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.teams.member(teamId, userId))
  },

  async leave(teamId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.teams.leave(teamId))
  },

  async transferOwner(teamId: Id, userId: number): Promise<TeamResponse> {
    const { data } = await api.patch<TeamResponse>(
      API_ENDPOINTS.teams.owner(teamId),
      { userId }
    )
    return data
  },
}
