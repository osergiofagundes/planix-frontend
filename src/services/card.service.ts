import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  CardChangeResponse,
  CardCompleteRequest,
  CardCreateRequest,
  CardMoveRequest,
  CardResponse,
  CardUpdateRequest,
} from "@/types/card.types"

export const cardService = {
  async listByList(listId: Id): Promise<CardResponse[]> {
    const { data } = await api.get<CardResponse[]>(
      API_ENDPOINTS.lists.cards(listId)
    )
    return data
  },

  async getById(cardId: Id): Promise<CardResponse> {
    const { data } = await api.get<CardResponse>(
      API_ENDPOINTS.cards.byId(cardId)
    )
    return data
  },

  async create(listId: Id, payload: CardCreateRequest): Promise<CardResponse> {
    const { data } = await api.post<CardResponse>(
      API_ENDPOINTS.lists.cards(listId),
      payload
    )
    return data
  },

  async update(cardId: Id, payload: CardUpdateRequest): Promise<CardResponse> {
    const { data } = await api.put<CardResponse>(
      API_ENDPOINTS.cards.byId(cardId),
      payload
    )
    return data
  },

  async remove(cardId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.cards.byId(cardId))
  },

  async move(cardId: Id, payload: CardMoveRequest): Promise<void> {
    await api.patch(API_ENDPOINTS.cards.move(cardId), payload)
  },

  async setCompleted(
    cardId: Id,
    payload: CardCompleteRequest
  ): Promise<CardResponse> {
    const { data } = await api.patch<CardResponse>(
      API_ENDPOINTS.cards.complete(cardId),
      payload
    )
    return data
  },

  async addLabel(cardId: Id, labelId: Id): Promise<void> {
    await api.post(API_ENDPOINTS.cards.label(cardId, labelId))
  },

  async removeLabel(cardId: Id, labelId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.cards.label(cardId, labelId))
  },

  async addAssignee(cardId: Id, userId: Id): Promise<void> {
    await api.post(API_ENDPOINTS.cards.assignee(cardId, userId))
  },

  async removeAssignee(cardId: Id, userId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.cards.assignee(cardId, userId))
  },

  async changes(cardId: Id): Promise<CardChangeResponse[]> {
    const { data } = await api.get<CardChangeResponse[]>(
      API_ENDPOINTS.cards.changes(cardId)
    )
    return data
  },
}
