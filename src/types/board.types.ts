import type { UserSummary } from "@/types/user.types"

export interface BoardResponse {
  id: number
  name: string
  description: string | null
  owner: UserSummary
  createdAt: string
  updatedAt: string
}

export interface BoardRequest {
  name: string
  description?: string | null
}

export interface BoardListResponse {
  id: number
  boardId: number
  name: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface BoardListRequest {
  name: string
}

export interface LabelResponse {
  id: number
  boardId: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface LabelRequest {
  name: string
  color: string
}

export interface MoveRequest {
  position: number
}
