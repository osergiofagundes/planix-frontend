import type { UserSummary } from "@/types/user.types"

export const NOTIFICATION_TYPES = [
  "CARD_MOVED",
  "CARD_ASSIGNED",
  "CARD_COMMENTED",
  "CARD_DUE_SOON",
  "CARD_DUE_OVERDUE",
  "TEAM_MEMBER_JOINED",
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationRef {
  id: number
  name: string
}

export interface NotificationItem {
  id: string
  type: NotificationType
  occurredAt: string
  read: boolean
  actor: UserSummary | null
  board: NotificationRef | null
  card: NotificationRef | null
  team: NotificationRef | null
  data: Record<string, string>
}

export interface NotificationPage {
  items: NotificationItem[]
  nextCursor: string | null
}

export interface UnreadCount {
  count: number
  capped: boolean
}

export interface WsTicket {
  ticket: string
  expiresIn: number
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  CARD_MOVED: "ArrowRightLeft",
  CARD_ASSIGNED: "UserPlus",
  CARD_COMMENTED: "MessageSquare",
  CARD_DUE_SOON: "Clock",
  CARD_DUE_OVERDUE: "AlertTriangle",
  TEAM_MEMBER_JOINED: "Users",
}

export function notificationText(item: NotificationItem): string {
  const card = item.card?.name ?? "um cartão"
  const board = item.board?.name ?? "um quadro"

  switch (item.type) {
    case "CARD_MOVED": {
      const destino = item.data.toList
      return destino
        ? `moveu "${card}" para ${destino}`
        : `moveu "${card}" de lista`
    }
    case "CARD_ASSIGNED":
      return `atribuiu "${card}" a você`
    case "CARD_COMMENTED": {
      const trecho = item.data.excerpt
      return trecho
        ? `comentou em "${card}": ${trecho}`
        : `comentou em "${card}"`
    }
    case "CARD_DUE_SOON":
      return `"${card}" vence em menos de 24 horas`
    case "CARD_DUE_OVERDUE":
      return `"${card}" está com o prazo vencido`
    case "TEAM_MEMBER_JOINED":
      return `entrou na equipe ${item.team?.name ?? board}`
  }
}

export function hasActorSubject(type: NotificationType): boolean {
  return type !== "CARD_DUE_SOON" && type !== "CARD_DUE_OVERDUE"
}
