import { Badge } from "@/components/ui/badge"
import { resolveLabelColor } from "@/lib/label-colors"
import { cn } from "@/lib/utils"
import type { LabelResponse } from "@/types/board.types"

interface LabelBadgeProps {
  label: LabelResponse
  className?: string
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
  const color = resolveLabelColor(label.color)

  return (
    <Badge
      variant="default"
      className={cn(color.badgeClassName, className, "text-white") }
      title={label.name}
    >
      {label.name}
    </Badge>
  )
}
