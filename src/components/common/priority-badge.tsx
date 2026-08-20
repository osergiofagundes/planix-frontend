import { Badge } from "@/components/ui/badge"
import { PRIORITY_CLASSNAMES, PRIORITY_LABELS } from "@/lib/card-priority"
import { cn } from "@/lib/utils"
import type { CardPriority } from "@/types/card.types"

interface PriorityBadgeProps {
  priority: CardPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === "NONE") {
    return null
  }

  return (
    <Badge
      variant="secondary"
      className={cn(PRIORITY_CLASSNAMES[priority], "uppercase", className, "text-white")}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
