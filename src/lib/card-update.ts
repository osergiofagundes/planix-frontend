import type { CardResponse, CardUpdateRequest } from "@/types/card.types"

export function toCardUpdateRequest(
  card: CardResponse,
  patch: Partial<CardUpdateRequest> = {}
): CardUpdateRequest {
  return {
    title: patch.title ?? card.title,
    description: "description" in patch ? patch.description : card.description,
    dueDate: "dueDate" in patch ? patch.dueDate : card.dueDate,
    priority: "priority" in patch ? patch.priority : card.priority,
  }
}
