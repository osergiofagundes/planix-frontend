import { useState } from "react"
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic"
import { SquareKanbanIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const MAX_RESULTS = 150

const DEFAULT_ICON_NAMES: readonly IconName[] = [
  "square-kanban",
  "layout-grid",
  "folder",
  "folder-open",
  "target",
  "rocket",
  "briefcase",
  "lightbulb",
  "flag",
  "star",
  "calendar",
  "bar-chart-3",
  "list-checks",
  "trophy",
  "palette",
  "code",
  "database",
  "globe",
  "heart",
  "home",
  "map",
  "megaphone",
  "notebook",
  "package",
  "pencil",
  "shield",
  "sparkles",
  "wrench",
  "users",
  "clipboard-list",
  "book-open",
  "compass",
  "gauge",
  "puzzle",
  "building-2",
]

interface BoardIconPickerProps {
  value: string | null | undefined
  onChange: (value: string | null) => void
}

export function BoardIconPicker({ value, onChange }: BoardIconPickerProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredNames = normalizedQuery
    ? iconNames.filter((name) => name.includes(normalizedQuery))
    : DEFAULT_ICON_NAMES
  const visibleNames = filteredNames.slice(0, MAX_RESULTS)
  const hasMoreResults = filteredNames.length > MAX_RESULTS

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="outline" />}>
        {value ? (
          <DynamicIcon name={value as IconName} data-icon="inline-start" />
        ) : (
          <SquareKanbanIcon data-icon="inline-start" />
        )}
        {value ? "Alterar ícone" : "Escolher ícone"}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-104">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Buscar ícone…"
            aria-label="Buscar ícone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto p-2">
            {visibleNames.map((name) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={value === name}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
                  value === name && "bg-accent text-foreground ring-2 ring-ring"
                )}
              >
                <DynamicIcon name={name} className="size-4" />
              </button>
            ))}
          </div>

          {hasMoreResults && (
            <p className="text-xs text-muted-foreground">
              Mostrando {MAX_RESULTS} de {filteredNames.length} resultados.
              Refine a busca para ver mais.
            </p>
          )}

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              Remover ícone
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
