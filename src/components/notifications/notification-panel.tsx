import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BellIcon, CheckCheckIcon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications"
import { PATHS } from "@/routes/paths"
import type { NotificationItem as Item } from "@/types/notification.types"

interface NotificationPanelProps {
  onNavigate: () => void
}

export function NotificationPanel({ onNavigate }: NotificationPanelProps) {
  const navigate = useNavigate()
  const notifications = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items = notifications.data?.pages.flatMap((page) => page.items) ?? []
  const temNaoLida = items.some((item) => !item.read)

  function handleSelect(item: Item) {
    if (!item.read) {
      markRead.mutate(item.id)
    }
    navigate(destinoDe(item))
    onNavigate()
  }

  return (
    <div className="flex max-h-[70svh] flex-col">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Notificações</span>
        {temNaoLida && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheckIcon data-icon="inline-start" />
            Marcar todas
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {notifications.isPending && <PanelSkeleton />}

        {notifications.isError && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {normalizeApiError(notifications.error).message}
          </p>
        )}

        {notifications.isSuccess && items.length === 0 && (
          <Empty className="min-h-[12rem]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellIcon />
              </EmptyMedia>
              <EmptyTitle>Nada por aqui</EmptyTitle>
              <EmptyDescription>
                Quando alguém mexer nos seus cartões ou nas suas equipes, você
                fica sabendo por aqui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {items.map((item) => (
          <NotificationItem key={item.id} item={item} onSelect={handleSelect} />
        ))}

        {notifications.hasNextPage && (
          <LoadMoreSentinel
            onReach={notifications.fetchNextPage}
            loading={notifications.isFetchingNextPage}
          />
        )}
      </div>
    </div>
  )
}

function destinoDe(item: Item): string {
  if (item.board && item.card) {
    return PATHS.card(item.board.id, item.card.id)
  }
  if (item.board) {
    return PATHS.board(item.board.id)
  }
  return PATHS.teams
}

interface LoadMoreSentinelProps {
  onReach: () => void
  loading: boolean
}

function LoadMoreSentinel({ onReach, loading }: LoadMoreSentinelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const alvo = ref.current
    if (!alvo) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        onReach()
      }
    })

    observer.observe(alvo)
    return () => observer.disconnect()
  }, [onReach])

  return (
    <div ref={ref} className="flex justify-center py-3">
      {loading && <Spinner />}
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      {[0, 1, 2, 3].map((linha) => (
        <div key={linha} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
