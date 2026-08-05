import { SquareKanbanIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface PlanixLogoProps {
  className?: string
  wordmarkClassName?: string
}

export function PlanixLogo({ className, wordmarkClassName }: PlanixLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-7 shrink-0 items-center justify-center bg-primary text-primary-foreground">
        <SquareKanbanIcon className="size-4" />
      </span>
      <span
        className={cn(
          "font-heading text-2xl font-medium tracking-tight",
          wordmarkClassName
        )}
      >
        Planix
      </span>
    </div>
  )
}
