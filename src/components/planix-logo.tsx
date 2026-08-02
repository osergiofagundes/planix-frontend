import { SquareKanbanIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Marca do Planix: ícone + wordmark. */
export function PlanixLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground">
        <SquareKanbanIcon className="size-4" />
      </span>
      <span className="font-heading text-2xl font-medium tracking-tight">
        Planix
      </span>
    </div>
  )
}
