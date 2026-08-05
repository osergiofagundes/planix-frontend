import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useUpdateCard } from "@/hooks/use-card"
import { isCardPriority } from "@/lib/card-filter"
import { PRIORITY_LABELS, SELECTABLE_PRIORITIES } from "@/lib/card-priority"
import type { CardResponse } from "@/types/card.types"

interface CardPriorityFieldProps {
  card: CardResponse
}

export function CardPriorityField({ card }: CardPriorityFieldProps) {
  const updateCard = useUpdateCard(card)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        Prioridade
      </span>

      <ToggleGroup
        variant="outline"
        size="sm"
        className="w-full"
        aria-label="Prioridade do cartão"
        value={card.priority === "NONE" ? [] : [card.priority]}
        onValueChange={(values) => {
          const next = values.at(-1)
          updateCard.mutate({
            priority: isCardPriority(next) ? next : "NONE",
          })
        }}
      >
        {SELECTABLE_PRIORITIES.map((priority) => (
          <ToggleGroupItem
            key={priority}
            value={priority}
            className="flex-1"
            disabled={updateCard.isPending}
          >
            {PRIORITY_LABELS[priority]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
