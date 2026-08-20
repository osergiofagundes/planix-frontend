import { useEffect } from "react"
import type { InfiniteData } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-client"
import { createRealtimeSocket } from "@/lib/realtime-socket"
import { AUTH_LOGOUT_EVENT, tokenStorage } from "@/lib/token-storage"
import { notificationService } from "@/services/notification.service"
import type {
  NotificationItem,
  NotificationPage,
  UnreadCount,
} from "@/types/notification.types"

const NOTIFICATION_CREATED = "NOTIFICATION_CREATED"

export function useRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tokenStorage.hasSession()) {
      return
    }

    const socket = createRealtimeSocket({
      requestTicket: async () => (await notificationService.wsTicket()).ticket,

      onFrame: (frame) => {
        if (frame.type !== NOTIFICATION_CREATED) {
          return
        }
        const item = frame.payload as NotificationItem

        queryClient.setQueryData<InfiniteData<NotificationPage>>(
          queryKeys.notifications.list,
          (atual) => {
            if (!atual || atual.pages.length === 0) {
              return atual
            }
            const [primeira, ...resto] = atual.pages

            if (primeira.items.some((existente) => existente.id === item.id)) {
              return atual
            }

            return {
              ...atual,
              pages: [
                { ...primeira, items: [item, ...primeira.items] },
                ...resto,
              ],
            }
          }
        )

        queryClient.setQueryData<UnreadCount>(
          queryKeys.notifications.unreadCount,
          (atual) => (atual ? { ...atual, count: atual.count + 1 } : atual)
        )
      },

      onReconnect: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.all,
        })
      },
    })

    window.addEventListener(AUTH_LOGOUT_EVENT, socket.close)

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, socket.close)
      socket.close()
    }
  }, [queryClient])
}
