import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  NotificationPage,
  UnreadCount,
  WsTicket,
} from "@/types/notification.types"

const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || ""

export function realtimeUrl(path: string): string {
  return `${REALTIME_URL}${path}`
}

interface ListParams {
  limit?: number
  before?: string
}

export const notificationService = {
  async list({
    limit = 20,
    before,
  }: ListParams = {}): Promise<NotificationPage> {
    const { data } = await api.get<NotificationPage>(
      realtimeUrl(API_ENDPOINTS.notifications.root),
      { params: { limit, before } }
    )
    return data
  },

  async unreadCount(): Promise<UnreadCount> {
    const { data } = await api.get<UnreadCount>(
      realtimeUrl(API_ENDPOINTS.notifications.unreadCount)
    )
    return data
  },

  async markRead(id: Id): Promise<void> {
    await api.post(realtimeUrl(API_ENDPOINTS.notifications.read(id)))
  },

  async markAllRead(): Promise<void> {
    await api.post(realtimeUrl(API_ENDPOINTS.notifications.readAll))
  },

  async wsTicket(): Promise<WsTicket> {
    const { data } = await api.post<WsTicket>(
      realtimeUrl(API_ENDPOINTS.notifications.wsTicket)
    )
    return data
  },
}
