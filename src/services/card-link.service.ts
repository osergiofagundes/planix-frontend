import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { CardLinkRequest, CardLinkResponse } from "@/types/card.types"

export const cardLinkService = {
  async listByCard(cardId: Id): Promise<CardLinkResponse[]> {
    const { data } = await api.get<CardLinkResponse[]>(
      API_ENDPOINTS.cards.links(cardId)
    )
    return data
  },

  async create(cardId: Id, payload: CardLinkRequest): Promise<CardLinkResponse> {
    const { data } = await api.post<CardLinkResponse>(
      API_ENDPOINTS.cards.links(cardId),
      payload
    )
    return data
  },

  async update(linkId: Id, payload: CardLinkRequest): Promise<CardLinkResponse> {
    const { data } = await api.put<CardLinkResponse>(
      API_ENDPOINTS.links.byId(linkId),
      payload
    )
    return data
  },

  async remove(linkId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.links.byId(linkId))
  },
}
