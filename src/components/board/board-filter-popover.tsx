import { ListFilterIcon } from "lucide-react"

import { LabelBadge } from "@/components/common/label-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useBoardLabels } from "@/hooks/use-board-labels"
import { useCardFilter } from "@/hooks/use-card-filter"
import { countActiveFilters, isCardPriority } from "@/lib/card-filter"
import { PRIORITY_LABELS, SELECTABLE_PRIORITIES } from "@/lib/card-priority"
import type { UserSummary } from "@/types/user.types"

interface BoardFilterPopoverProps {
  boardId: string
  members: UserSummary[]
}

export function BoardFilterPopover({
  boardId,
  members,
}: BoardFilterPopoverProps) {
  const { filter, setFilter, clearFilter } = useCardFilter()
  const labels = useBoardLabels(boardId)

  const activeCount = countActiveFilters(filter)

  function toggleId(list: number[], id: number): number[] {
    return list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id]
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <ListFilterIcon data-icon="inline-start" />
        Filtro
        {activeCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto">
        <div className="flex max-h-[70svh] flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium">Filtrar cartões</h2>
            <Button
              variant="ghost"
              size="xs"
              disabled={activeCount === 0}
              onClick={clearFilter}
            >
              Limpar tudo
            </Button>
          </div>

          <Field>
            <FieldLabel htmlFor="card-filter-search">Buscar</FieldLabel>
            <Input
              id="card-filter-search"
              placeholder="Título ou descrição"
              autoComplete="off"
              value={filter.search}
              onChange={(event) =>
                setFilter({ ...filter, search: event.target.value })
              }
              className="min-w-60"
            />
          </Field>

          {members.length > 0 && (
            <FieldSet>
              <FieldLegend variant="label">Responsável</FieldLegend>
              <div className="flex flex-col gap-1">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-2 p-1 hover:bg-accent"
                  >
                    <Checkbox
                      checked={filter.assigneeIds.includes(member.id)}
                      onCheckedChange={() =>
                        setFilter({
                          ...filter,
                          assigneeIds: toggleId(filter.assigneeIds, member.id),
                        })
                      }
                    />
                    <UserAvatar user={member} size="sm" showTooltip={false} />
                    <span className="min-w-0 flex-1 truncate">
                      {member.name}
                    </span>
                  </label>
                ))}
              </div>
            </FieldSet>
          )}

          {labels.data && labels.data.length > 0 && (
            <FieldSet>
              <FieldLegend variant="label">Etiqueta</FieldLegend>
              <div className="flex flex-col gap-1">
                {labels.data.map((label) => (
                  <label
                    key={label.id}
                    className="flex cursor-pointer items-center gap-2 p-1 hover:bg-accent"
                  >
                    <Checkbox
                      checked={filter.labelIds.includes(label.id)}
                      onCheckedChange={() =>
                        setFilter({
                          ...filter,
                          labelIds: toggleId(filter.labelIds, label.id),
                        })
                      }
                    />
                    <LabelBadge label={label} />
                  </label>
                ))}
              </div>
            </FieldSet>
          )}

          <FieldSet>
            <FieldLegend variant="label">Prioridade</FieldLegend>
            <ToggleGroup
              multiple
              variant="outline"
              size="sm"
              className="flex-wrap"
              value={filter.priorities}
              onValueChange={(values) =>
                setFilter({ ...filter, priorities: values.filter(isCardPriority) })
              }
            >
              {SELECTABLE_PRIORITIES.map((priority) => (
                <ToggleGroupItem key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>

          <Separator />

          <Field orientation="horizontal">
            <FieldLabel htmlFor="card-filter-hide-completed">
              Ocultar concluídos
            </FieldLabel>
            <Switch
              id="card-filter-hide-completed"
              checked={filter.hideCompleted}
              onCheckedChange={(hideCompleted) =>
                setFilter({ ...filter, hideCompleted })
              }
            />
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  )
}
