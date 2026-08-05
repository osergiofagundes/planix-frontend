import { useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { LabelBadge } from "@/components/label-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  useBoardLabels,
  useCreateLabel,
  useDeleteLabel,
  useUpdateLabel,
} from "@/hooks/use-board-labels"
import { DEFAULT_LABEL_COLOR, LABEL_COLORS } from "@/lib/label-colors"
import { cn } from "@/lib/utils"
import { labelSchema } from "@/schemas/board.schema"
import type { LabelResponse } from "@/types/board.types"

export function BoardLabelsTab({ boardId }: { boardId: string }) {
  const labels = useBoardLabels(boardId)
  const deleteLabel = useDeleteLabel(boardId)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [labelToDelete, setLabelToDelete] = useState<LabelResponse | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiquetas do quadro</CardTitle>
        <CardDescription>
          A etiqueta pertence ao quadro: criar uma vez serve para quantos
          cartões você quiser.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {labels.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : labels.data && labels.data.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {labels.data.map((label) => (
              <li key={label.id}>
                {editingId === label.id ? (
                  <LabelForm
                    boardId={boardId}
                    label={label}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-2 py-1">
                    <LabelBadge label={label} />
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar a etiqueta ${label.name}`}
                        onClick={() => setEditingId(label.id)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir a etiqueta ${label.name}`}
                        onClick={() => setLabelToDelete(label)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Este quadro ainda não tem etiquetas.
          </p>
        )}

        <Separator />

        <LabelForm boardId={boardId} />
      </CardContent>

      {labelToDelete && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setLabelToDelete(null)}
          title={`Excluir a etiqueta "${labelToDelete.name}"?`}
          description="Ela some de todos os cartões do quadro. Os cartões continuam intactos."
          confirmLabel="Excluir etiqueta"
          isPending={deleteLabel.isPending}
          onConfirm={() =>
            deleteLabel.mutate(labelToDelete.id, {
              onSuccess: () => setLabelToDelete(null),
            })
          }
        />
      )}
    </Card>
  )
}

interface LabelFormProps {
  boardId: string
  label?: LabelResponse
  onDone?: () => void
}

function LabelForm({ boardId, label, onDone }: LabelFormProps) {
  const isEditing = Boolean(label)

  const [name, setName] = useState(label?.name ?? "")
  const [color, setColor] = useState(label?.color ?? DEFAULT_LABEL_COLOR.value)
  const [error, setError] = useState<string | null>(null)

  const createLabel = useCreateLabel(boardId)
  const updateLabel = useUpdateLabel(boardId)
  const mutation = isEditing ? updateLabel : createLabel

  function submit() {
    const parsed = labelSchema.safeParse({ name, color })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Etiqueta inválida.")
      return
    }

    const onError = (mutationError: unknown) => {
      const normalized = normalizeApiError(mutationError)
      setError(normalized.fieldErrors.name ?? normalized.message)
    }

    if (label) {
      updateLabel.mutate(
        { labelId: label.id, ...parsed.data },
        { onSuccess: () => onDone?.(), onError }
      )
      return
    }

    createLabel.mutate(parsed.data, {
      onSuccess: () => {
        setName("")
        setError(null)
      },
      onError,
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="min-w-40 flex-1"
          placeholder={isEditing ? label?.name : "Nova etiqueta *"}
          value={name}
          aria-label={isEditing ? "Nome da etiqueta" : "Nome da nova etiqueta"}
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

            if (event.key === "Escape" && onDone) {
              onDone()
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
                "size-5 ring-offset-2 ring-offset-card",
                option.swatchClassName,
                color === option.value && "ring-2 ring-ring"
              )}
            />
          ))}
        </div>

        <Button size="sm" onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            !isEditing && <PlusIcon data-icon="inline-start" />
          )}
          {isEditing ? "Salvar" : "Criar etiqueta"}
        </Button>

        {onDone && (
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>

      {error && <p className="text-destructive">{error}</p>}
    </div>
  )
}
