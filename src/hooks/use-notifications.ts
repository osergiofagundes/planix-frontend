import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { notificationService } from "@/services/notification.service"
import type { UnreadCount } from "@/types/notification.types"

const INTERVALO_DO_CONTADOR = 5 * 60_000

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: ({ pageParam }) =>
      notificationService.list({ limit: 20, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: INTERVALO_DO_CONTADOR,
    retry: false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      const contadorAnterior = queryClient.getQueryData<UnreadCount>(
        queryKeys.notifications.unreadCount
      )

      queryClient.setQueryData<UnreadCount>(
        queryKeys.notifications.unreadCount,
        (atual) =>
          atual ? { ...atual, count: Math.max(0, atual.count - 1) } : atual
      )

      return { contadorAnterior, id }
    },

    onError: (error, _id, context) => {
      if (context?.contadorAnterior) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount,
          context.contadorAnterior
        )
      }
      toastApiError(error, "Não foi possível marcar como lida")
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
    onError: (error) =>
      toastApiError(error, "Não foi possível marcar todas como lidas"),
  })
}
