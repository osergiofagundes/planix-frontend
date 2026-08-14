import { Fragment } from "react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { cn } from "@/lib/utils"

export interface TopbarTitleSegment {
  icon: IconName
  label: string
  /** Some abaixo de `sm` — a topbar do quadro fica apertada no celular. */
  hideOnMobile?: boolean
}

interface TopbarTitleProps {
  segments: TopbarTitleSegment[]
}

export function TopbarTitle({ segments }: TopbarTitleProps) {
  return (
    <h1 className="flex min-w-0 flex-1 items-center gap-2 font-heading text-base font-medium">
      {segments.map((segment, index) => (
        <Fragment key={segment.label}>
          {index > 0 && (
            <span
              aria-hidden
              className={cn(
                "shrink-0 text-muted-foreground",
                segments[index - 1].hideOnMobile && "max-sm:hidden"
              )}
            >
              -
            </span>
          )}

          <span
            className={cn(
              "flex min-w-0 items-center gap-1.5",
              segment.hideOnMobile && "max-sm:hidden"
            )}
          >
            <DynamicIcon
              name={segment.icon}
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="truncate">{segment.label}</span>
          </span>
        </Fragment>
      ))}
    </h1>
  )
}
