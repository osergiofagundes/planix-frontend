import { Link } from "react-router-dom"
import { CalendarIcon, CircleCheckIcon } from "lucide-react"

import { LabelBadge } from "@/components/common/label-badge"
import { PriorityBadge } from "@/components/common/priority-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { formatDueDate, isOverdue } from "@/lib/date"
import { cn } from "@/lib/utils"
import { PATHS } from "@/routes/paths"
import type { CardResponse } from "@/types/card.types"

interface BoardCardProps {
  card: CardResponse
  boardId: string
  isOverlay?: boolean
  className?: string
}

export function BoardCard({
  card,
  boardId,
  isOverlay = false,
  className,
}: BoardCardProps) {
  const overdue = !card.completed && isOverdue(card.dueDate)

  return (
    <article
      className={cn(
        "relative flex flex-col gap-2 border bg-card p-3 text-card-foreground transition-colors",
        !isOverlay && "hover:border-primary/50",
        isOverlay && "rotate-2 shadow-lg",
        card.completed && "opacity-60",
        className
      )}
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      <div className="flex items-start gap-1.5">
        {card.completed && (
          <CircleCheckIcon
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            aria-label="Concluído"
          />
        )}

        <h3 className="text-xs/relaxed font-medium">
          {isOverlay ? (
            card.title
          ) : (
            <Link
              to={PATHS.card(boardId, card.id)}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {card.title}
            </Link>
          )}
        </h3>
      </div>

      {(card.dueDate || card.priority !== "NONE" || card.assignees.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {card.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-3" />
              {formatDueDate(card.dueDate)}
            </span>
          )}

          <PriorityBadge priority={card.priority} />

          {card.assignees.length > 0 && (
            <div className="ml-auto flex -space-x-1.5">
              {card.assignees.slice(0, 3).map((assignee) => (
                <UserAvatar
                  key={assignee.id}
                  user={assignee}
                  size="sm"
                  showTooltip={false}
                  className="ring-2 ring-card"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
