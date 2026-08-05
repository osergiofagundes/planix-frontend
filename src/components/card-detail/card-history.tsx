import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDayHeading, formatTime, toDayKey } from "@/lib/date"
import { useCardChanges } from "@/hooks/use-card"
import type { CardChangeResponse } from "@/types/card.types"

const FIELD_LABELS: Record<string, string> = {
  title: "o título",
  description: "a descrição",
  dueDate: "o prazo",
  due_date: "o prazo",
  priority: "a prioridade",
  listId: "a lista",
  list_id: "a lista",
  position: "a posição",
  completed: "a conclusão",
}

function describeField(field: string): string {
  return FIELD_LABELS[field] ?? `o campo "${field}"`
}

function describeValue(value: string | null): string {
  if (value === null || value.trim() === "") {
    return "vazio"
  }

  return value
}

interface CardHistoryProps {
  cardId: string
  enabled: boolean
}

export function CardHistory({ cardId, enabled }: CardHistoryProps) {
  const changes = useCardChanges(cardId, enabled)

  if (changes.isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!changes.data || changes.data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nenhuma alteração registrada ainda.
      </p>
    )
  }

  const days = groupByDay(changes.data)

  return (
    <div className="flex flex-col gap-5">
      {days.map(([dayKey, entries]) => (
        <section key={dayKey} className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            {formatDayHeading(entries[0].changedAt)}
          </h3>

          <ul className="flex flex-col gap-3">
            {entries.map((change, index) => (
              <li key={`${dayKey}-${index}`} className="flex gap-2">
                <UserAvatar
                  user={change.author}
                  size="sm"
                  showTooltip={false}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-xs/relaxed">
                    <span className="font-medium">{change.author.name}</span>{" "}
                    alterou {describeField(change.field)} de{" "}
                    <span className="font-medium">
                      {describeValue(change.oldValue)}
                    </span>{" "}
                    para{" "}
                    <span className="font-medium">
                      {describeValue(change.newValue)}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(change.changedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function groupByDay(
  changes: CardChangeResponse[]
): [string, CardChangeResponse[]][] {
  const groups = new Map<string, CardChangeResponse[]>()

  for (const change of changes) {
    const key = toDayKey(change.changedAt)
    const existing = groups.get(key)

    if (existing) {
      existing.push(change)
    } else {
      groups.set(key, [change])
    }
  }

  return [...groups.entries()]
}
