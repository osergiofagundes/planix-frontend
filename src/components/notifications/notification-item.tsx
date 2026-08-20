import {
  AlertTriangleIcon,
  ArrowRightLeftIcon,
  ClockIcon,
  MessageSquareIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/common/user-avatar"
import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import {
  hasActorSubject,
  notificationText,
  type NotificationItem as Item,
  type NotificationType,
} from "@/types/notification.types"

const ICONS: Record<NotificationType, LucideIcon> = {
  CARD_MOVED: ArrowRightLeftIcon,
  CARD_ASSIGNED: UserPlusIcon,
  CARD_COMMENTED: MessageSquareIcon,
  CARD_DUE_SOON: ClockIcon,
  CARD_DUE_OVERDUE: AlertTriangleIcon,
  TEAM_MEMBER_JOINED: UsersIcon,
}

interface NotificationItemProps {
  item: Item
  onSelect: (item: Item) => void
}

export function NotificationItem({ item, onSelect }: NotificationItemProps) {
  const Icon = ICONS[item.type]
  const comAtor = hasActorSubject(item.type) && item.actor !== null

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
        "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
        !item.read && "bg-accent/40"
      )}
    >
      {comAtor && item.actor ? (
        <UserAvatar user={item.actor} size="sm" showTooltip={false} />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm leading-snug">
          {comAtor && item.actor && (
            <span className="font-medium">{item.actor.name} </span>
          )}
          <span className="text-muted-foreground">
            {notificationText(item)}
          </span>
        </span>

        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {comAtor && <Icon className="size-3" />}
          {item.board && <span className="truncate">{item.board.name}</span>}
          {item.board && <span aria-hidden>·</span>}
          <span>{formatRelativeTime(item.occurredAt)}</span>
        </span>
      </span>

      {!item.read && (
        <span
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
          aria-label="Não lida"
        />
      )}
    </button>
  )
}
