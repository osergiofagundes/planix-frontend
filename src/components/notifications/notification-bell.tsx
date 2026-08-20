import { useState } from "react"
import { BellIcon } from "lucide-react"

import { NotificationPanel } from "@/components/notifications/notification-panel"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUnreadCount } from "@/hooks/use-notifications"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const unread = useUnreadCount()

  const count = unread.data?.count ?? 0
  const capped = unread.data?.capped ?? false

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              count > 0 ? `Notificações (${count} não lidas)` : "Notificações"
            }
            className="relative"
          />
        }
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-medium text-primary-foreground">
            {capped ? "99+" : count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <NotificationPanel onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
