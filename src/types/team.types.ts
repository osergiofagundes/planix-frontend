import type { UserSummary } from "@/types/user.types"

export type TeamRole = "OWNER" | "ADMIN" | "MEMBER"

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  OWNER: "Dono",
  ADMIN: "Administrador",
  MEMBER: "Membro",
}

export function isTeamAdmin(role: TeamRole | undefined): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export interface TeamResponse {
  id: number
  name: string
  description: string | null
  icon: string | null
  owner: UserSummary
  myRole: TeamRole
  memberCount: number
  boardCount: number
  createdAt: string
  updatedAt: string
}

export interface TeamRequest {
  name: string
  description?: string | null
  icon: string | null
}

export interface TeamMemberResponse {
  user: UserSummary
  role: TeamRole
  joinedAt: string
}

export interface RoleChangeRequest {
  role: Exclude<TeamRole, "OWNER">
}
