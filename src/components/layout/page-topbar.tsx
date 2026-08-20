import type { ReactNode } from "react"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface PageTopbarProps {
  children: ReactNode
  className?: string
}
export function PageTopbar({ children, className }: PageTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6",
        className
      )}
    >
      <SidebarTrigger className="-ml-3" />
      {children}
      <div className="ms-auto">
        <NotificationBell />
      </div>
    </header>
  )
}
