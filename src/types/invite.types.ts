import type { UserSummary } from "@/types/user.types"

export interface InviteRequest {
  expiresInDays?: number
  maxUses?: number
}

export interface InviteCreatedResponse {
  id: number
  token: string
  expiresAt: string
  maxUses: number
}

export interface InviteResponse {
  id: number
  uses: number
  maxUses: number
  expiresAt: string
  revokedAt: string | null
  createdAt: string
}

export interface InvitePreviewResponse {
  boardName: string
  invitedBy: UserSummary
  expiresAt: string
}

export interface TokenRequest {
  token: string
}

export interface OwnerTransferRequest {
  userId: number
}

export type InviteStatus = "REVOKED" | "EXPIRED" | "EXHAUSTED" | "ACTIVE"

export function inviteStatus(
  invite: InviteResponse,
  now: Date = new Date()
): InviteStatus {
  if (invite.revokedAt) {
    return "REVOKED"
  }

  if (new Date(invite.expiresAt).getTime() <= now.getTime()) {
    return "EXPIRED"
  }

  if (invite.uses >= invite.maxUses) {
    return "EXHAUSTED"
  }

  return "ACTIVE"
}

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  REVOKED: "Revogado",
  EXPIRED: "Expirado",
  EXHAUSTED: "Esgotado",
  ACTIVE: "Ativo",
}
