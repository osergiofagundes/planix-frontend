import { lazy, Suspense, useState, type ReactElement } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { QUICK_REACTIONS } from "@/types/card.types"

const EmojiPicker = lazy(() => import("@/components/common/emoji-picker"))

interface EmojiPickerPopoverProps {
  trigger: ReactElement
  onPick: (emoji: string) => void
}

export function EmojiPickerPopover({
  trigger,
  onPick,
}: EmojiPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  function close() {
    setIsOpen(false)
    setShowAll(false)
  }

  function pick(emoji: string) {
    onPick(emoji)
    close()
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => (open ? setIsOpen(true) : close())}
    >
      <PopoverTrigger render={trigger} />

      <PopoverContent className="w-auto p-1" align="start">
        {showAll ? (
          <Suspense
            fallback={
              <div className="flex h-72 w-64 items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <EmojiPicker onPick={pick} />
          </Suspense>
        ) : (
          <div className="flex items-center gap-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon-sm"
                aria-label={`Reagir com ${emoji}`}
                onClick={() => pick(emoji)}
              >
                <span className="text-base leading-none">{emoji}</span>
              </Button>
            ))}

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Escolher outro emoji"
              onClick={() => setShowAll(true)}
            >
              <PlusIcon />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
