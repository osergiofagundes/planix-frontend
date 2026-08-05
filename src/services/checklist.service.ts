import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { MoveRequest } from "@/types/board.types"
import type {
  ChecklistItemRequest,
  ChecklistItemResponse,
} from "@/types/card.types"

export const checklistService = {
  async listByCard(cardId: Id): Promise<ChecklistItemResponse[]> {
    const { data } = await api.get<ChecklistItemResponse[]>(
      API_ENDPOINTS.cards.checklist(cardId)
    )
    return data
  },

  async create(
    cardId: Id,
    payload: ChecklistItemRequest
  ): Promise<ChecklistItemResponse> {
    const { data } = await api.post<ChecklistItemResponse>(
      API_ENDPOINTS.cards.checklist(cardId),
      payload
    )
    return data
  },

  async update(
    itemId: Id,
    payload: ChecklistItemRequest
  ): Promise<ChecklistItemResponse> {
    const { data } = await api.put<ChecklistItemResponse>(
      API_ENDPOINTS.checklistItems.byId(itemId),
      payload
    )
    return data
  },

  async remove(itemId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.checklistItems.byId(itemId))
  },

  async toggle(itemId: Id): Promise<ChecklistItemResponse> {
    const { data } = await api.patch<ChecklistItemResponse>(
      API_ENDPOINTS.checklistItems.toggle(itemId)
    )
    return data
  },

  async move(itemId: Id, payload: MoveRequest): Promise<void> {
    await api.patch(API_ENDPOINTS.checklistItems.move(itemId), payload)
  },
}
