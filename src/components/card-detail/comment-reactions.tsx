import { SmilePlusIcon } from "lucide-react"

import { EmojiPickerPopover } from "@/components/card-detail/emoji-picker-popover"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { CommentReaction } from "@/types/card.types"

interface CommentReactionsProps {
  reactions: CommentReaction[]
  onToggle: (emoji: string) => void
}

export function CommentReactions({
  reactions,
  onToggle,
}: CommentReactionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => (
        <Tooltip key={reaction.emoji}>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                size="xs"
                aria-pressed={reaction.reactedByMe}
                onClick={() => onToggle(reaction.emoji)}
                className={cn(
                  "gap-1 tabular-nums",
                  reaction.reactedByMe &&
                    "bg-primary/15 ring-1 ring-primary/40 ring-inset"
                )}
              >
                <span className="text-sm leading-none">{reaction.emoji}</span>
                {reaction.count}
              </Button>
            }
          />
          <TooltipContent>{whoReacted(reaction)}</TooltipContent>
        </Tooltip>
      ))}

      <EmojiPickerPopover
        onPick={onToggle}
        trigger={
          <Button variant="ghost" size="icon-xs" aria-label="Adicionar reação">
            <SmilePlusIcon />
          </Button>
        }
      />
    </div>
  )
}

function whoReacted(reaction: CommentReaction): string {
  const names = reaction.users.map((user) => user.name)

  if (names.length <= 3) {
    return names.join(", ")
  }

  return `${names.slice(0, 3).join(", ")} e mais ${names.length - 3}`
}
