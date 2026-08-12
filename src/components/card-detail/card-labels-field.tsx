import { useState } from "react"
import { PlusIcon, TagIcon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { LabelBadge } from "@/components/common/label-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useBoardLabels, useCreateLabel } from "@/hooks/use-board-labels"
import { useToggleCardLabel } from "@/hooks/use-card"
import { cn } from "@/lib/utils"
import { DEFAULT_LABEL_COLOR, LABEL_COLORS } from "@/lib/label-colors"
import { labelSchema } from "@/schemas/board.schema"
import type { CardResponse } from "@/types/card.types"

interface CardLabelsFieldProps {
  card: CardResponse
  boardId: string
}

export function CardLabelsField({ card, boardId }: CardLabelsFieldProps) {
  const labels = useBoardLabels(boardId)
  const toggleLabel = useToggleCardLabel()

  const attachedIds = new Set(card.labels.map((label) => label.id))

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">Etiquetas</h3>

      <div className="flex flex-wrap items-center gap-1.5">
        {card.labels.map((label) => (
          <LabelBadge key={label.id} label={label} />
        ))}

        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>
            <TagIcon data-icon="inline-start" />
            {card.labels.length === 0 ? "Adicionar etiqueta" : "Editar"}
          </PopoverTrigger>

          <PopoverContent align="start" className="w-64">
            <div className="flex flex-col gap-2">
              {labels.isPending && (
                <p className="text-xs text-muted-foreground">Carregando…</p>
              )}

              {labels.isSuccess && labels.data.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Este quadro ainda não tem etiquetas.
                </p>
              )}

              {labels.data?.map((label) => {
                const attached = attachedIds.has(label.id)

                return (
                  <label
                    key={label.id}
                    className="flex cursor-pointer items-center gap-2 p-1 hover:bg-accent"
                  >
                    <Checkbox
                      checked={attached}
                      disabled={toggleLabel.isPending}
                      onCheckedChange={() =>
                        toggleLabel.mutate({
                          cardId: card.id,
                          labelId: label.id,
                          attached,
                        })
                      }
                    />
                    <LabelBadge label={label} />
                  </label>
                )
              })}

              <Separator />

              <NewLabelForm boardId={boardId} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  )
}

function NewLabelForm({ boardId }: { boardId: string }) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_LABEL_COLOR.value)
  const [error, setError] = useState<string | null>(null)

  const createLabel = useCreateLabel(boardId)

  function submit() {
    const parsed = labelSchema.safeParse({ name, color })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Etiqueta inválida.")
      return
    }

    createLabel.mutate(parsed.data, {
      onSuccess: () => {
        setName("")
        setError(null)
      },
      onError: (mutationError) => {
        const normalized = normalizeApiError(mutationError)
        setError(normalized.fieldErrors.name ?? normalized.message)
      },
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Nova etiqueta *"
        value={name}
        aria-label="Nome da nova etiqueta"
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          setName(event.target.value)
          setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            submit()
          }
        }}
      />

      <div className="flex flex-wrap gap-1">
        {LABEL_COLORS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={color === option.value}
            onClick={() => setColor(option.value)}
            className={cn(
              "size-5 ring-offset-2 ring-offset-popover",
              option.swatchClassName,
              color === option.value && "ring-2 ring-ring"
            )}
          />
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button size="sm" onClick={submit} disabled={createLabel.isPending}>
        {createLabel.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <PlusIcon data-icon="inline-start" />
        )}
        Criar etiqueta
      </Button>
    </div>
  )
}
