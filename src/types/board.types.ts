import type { UserSummary } from "@/types/user.types"

export type BoardVisibility = "TEAM" | "RESTRICTED"

export const BOARD_VISIBILITY_LABELS: Record<BoardVisibility, string> = {
  TEAM: "Toda a equipe",
  RESTRICTED: "Somente convidados",
}

export interface BoardResponse {
  id: number
  teamId: number
  name: string
  description: string | null
  icon: string | null
  visibility: BoardVisibility
  owner: UserSummary
  createdAt: string
  updatedAt: string
}

export interface BoardRequest {
  name: string
  description?: string | null
  icon: string | null
  visibility: BoardVisibility
}

export interface BoardCreateRequest extends BoardRequest {
  teamId: number
}

export interface AddMemberRequest {
  userId: number
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
