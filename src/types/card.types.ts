import type { LabelResponse } from "@/types/board.types"
import type { UserSummary } from "@/types/user.types"

export const CARD_PRIORITIES = ["NONE", "LOW", "MEDIUM", "HIGH"] as const

export type CardPriority = (typeof CARD_PRIORITIES)[number]

export interface CardResponse {
  id: number
  listId: number
  title: string
  description: string | null
  dueDate: string | null
  priority: CardPriority
  position: number
  completed: boolean
  completedAt: string | null
  labels: LabelResponse[]
  assignees: UserSummary[]
  createdAt: string
  updatedAt: string
}

export interface CardCreateRequest {
  title: string
}


export interface CardUpdateRequest {
  title: string
  description?: string | null
  dueDate?: string | null
  priority?: CardPriority | null
}

export interface CardMoveRequest {
  targetListId: number
  position: number
}

export interface CardCompleteRequest {
  completed: boolean
}

export interface ChecklistItemResponse {
  id: number
  cardId: number
  text: string
  done: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface ChecklistItemRequest {
  text: string
}

export interface CommentResponse {
  id: number
  cardId: number
  text: string
  author: UserSummary
  createdAt: string
  updatedAt: string
}

export interface CommentRequest {
  text: string
}

export interface CardLinkResponse {
  id: number
  cardId: number
  url: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface CardLinkRequest {
  url: string
  title?: string | null
}

export interface AttachmentResponse {
  id: number
  cardId: number
  originalFilename: string
  storedFilename: string
  contentType: string
  sizeBytes: number
  author: UserSummary
  createdAt: string
}

export interface CardChangeResponse {
  field: string
  oldValue: string | null
  newValue: string | null
  author: UserSummary
  changedAt: string
}
