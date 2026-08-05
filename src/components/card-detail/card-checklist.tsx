import { useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useChecklist,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useMoveChecklistItem,
  useToggleChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/use-checklist"
import { DRAG_ACTIVATION_DISTANCE } from "@/lib/drag"
import { cn } from "@/lib/utils"
import type { ChecklistItemResponse } from "@/types/card.types"

interface CardChecklistProps {
  cardId: string
}

export function CardChecklist({ cardId }: CardChecklistProps) {
  const checklist = useChecklist(cardId)
  const moveItem = useMoveChecklistItem(cardId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const items = checklist.data ?? []
  const done = items.filter((item) => item.done).length

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const toIndex = items.findIndex((item) => String(item.id) === over.id)

    if (toIndex < 0) {
      return
    }

    moveItem.mutate({ itemId: Number(active.id), toIndex })
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">Checklist</h3>

      {checklist.isPending ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <>
          {items.length > 0 && (
            <Progress value={(done / items.length) * 100}>
              <ProgressLabel>
                {done} de {items.length} concluídos
              </ProgressLabel>
              <ProgressValue />
            </Progress>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => String(item.id))}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col">
                {items.map((item) => (
                  <ChecklistRow key={item.id} cardId={cardId} item={item} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <ChecklistComposer cardId={cardId} />
        </>
      )}
    </section>
  )
}

interface ChecklistRowProps {
  cardId: string
  item: ChecklistItemResponse
}

function ChecklistRow({ cardId, item }: ChecklistRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(item.text)

  const toggleItem = useToggleChecklistItem(cardId)
  const updateItem = useUpdateChecklistItem(cardId)
  const deleteItem = useDeleteChecklistItem(cardId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(item.id) })

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || trimmed === item.text) {
      setText(item.text)
      setIsEditing(false)
      return
    }

    updateItem.mutate(
      { itemId: item.id, text: trimmed },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-2 px-1 py-1.5 hover:bg-accent",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reordenar "${item.text}"`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      <Checkbox
        checked={item.done}
        aria-label={item.text}
        onCheckedChange={() => toggleItem.mutate(item.id)}
      />

      {isEditing ? (
        <Input
          autoFocus
          className="h-7 flex-1"
          value={text}
          aria-label={`Texto do item "${item.text}"`}
          onChange={(event) => setText(event.target.value)}
          onBlur={submit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              submit()
            }

            if (event.key === "Escape") {
              setText(item.text)
              setIsEditing(false)
            }
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 text-left text-xs",
            item.done && "text-muted-foreground line-through"
          )}
        >
          {item.text}
        </button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir "${item.text}"`}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        disabled={deleteItem.isPending}
        onClick={() => deleteItem.mutate(item.id)}
      >
        <Trash2Icon />
      </Button>
    </li>
  )
}

function ChecklistComposer({ cardId }: { cardId: string }) {
  const [text, setText] = useState("")
  const createItem = useCreateChecklistItem(cardId)

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || createItem.isPending) {
      return
    }

    createItem.mutate(trimmed, { onSuccess: () => setText("") })
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8"
        placeholder="Adicionar um item *"
        value={text}
        aria-label="Novo item da checklist"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            submit()
          }
        }}
      />
      <Button
        size="icon-sm"
        variant="outline"
        aria-label="Adicionar item"
        onClick={submit}
        disabled={createItem.isPending}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
