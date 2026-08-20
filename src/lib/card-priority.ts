import { CARD_PRIORITIES, type CardPriority } from "@/types/card.types"

export const SELECTABLE_PRIORITIES = CARD_PRIORITIES.filter(
  (priority) => priority !== "NONE"
)

export const PRIORITY_LABELS: Record<CardPriority, string> = {
  NONE: "Sem prioridade",
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}

export const PRIORITY_CLASSNAMES: Record<CardPriority, string> = {
  NONE: "bg-muted text-muted-foreground",
  LOW: "bg-label-slate text-label-slate",
  MEDIUM: "bg-label-amber text-label-amber",
  HIGH: "bg-label-red text-label-red",
}
