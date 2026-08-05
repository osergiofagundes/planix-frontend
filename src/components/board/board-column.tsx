import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { BoardColumnMenu } from "@/components/board/board-column-menu"
import { CardComposer } from "@/components/board/card-composer"
import { SortableBoardCard } from "@/components/board/sortable-board-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateList } from "@/hooks/use-lists"
import { dragIdFor } from "@/lib/drag"
import { cn } from "@/lib/utils"
import type { BoardListResponse } from "@/types/board.types"
import type { CardResponse } from "@/types/card.types"

interface BoardColumnProps {
  boardId: string
  list: BoardListResponse
  cards: readonly CardResponse[]
  totalCards: number
  isLoadingCards: boolean
  isFiltered: boolean
}

export function BoardColumn({
  boardId,
  list,
  cards,
  totalCards,
  isLoadingCards,
  isFiltered,
}: BoardColumnProps) {
  const [isRenaming, setIsRenaming] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dragIdFor.list(list.id),
    data: { type: "list", list },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dragIdFor.column(list.id),
    data: { type: "column", listId: list.id },
  })

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col gap-2 self-start border bg-muted/40 p-2 max-sm:w-[80vw]",
        isDragging && "opacity-50"
      )}
      aria-label={`Lista ${list.name}`}
    >
      <header className="flex items-center gap-1">
        <button
          type="button"
          className="cursor-grab touch-none p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing"
          aria-label={`Reordenar a lista ${list.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>

        {isRenaming ? (
          <ColumnNameEditor
            boardId={boardId}
            list={list}
            onDone={() => setIsRenaming(false)}
          />
        ) : (
          <>
            <h2 className="min-w-0 flex-1 truncate text-xs font-medium">
              {list.name}
            </h2>
            <Badge variant="secondary">
              {isFiltered ? `${cards.length}/${totalCards}` : totalCards}
            </Badge>
            <BoardColumnMenu
              boardId={boardId}
              list={list}
              cardCount={totalCards}
              onStartRename={() => setIsRenaming(true)}
            />
          </>
        )}
      </header>

      <div
        ref={setDropRef}
        className={cn(
          "flex min-h-16 flex-col gap-2 p-0.5 transition-colors",
          isOver && "bg-accent"
        )}
      >
        {isLoadingCards && cards.length === 0 ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (
          <SortableContext
            items={cards.map((card) => dragIdFor.card(card.id))}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <SortableBoardCard key={card.id} card={card} boardId={boardId} />
            ))}
          </SortableContext>
        )}

        {!isLoadingCards && cards.length === 0 && (
          <p className="px-2 py-2 text-center text-xs text-muted-foreground">
            {isFiltered && totalCards > 0
              ? "Nenhum cartão corresponde ao filtro."
              : "Nenhum cartão aqui. Arraste um para cá."}
          </p>
        )}
      </div>

      <CardComposer listId={list.id} />
    </section>
  )
}

interface ColumnNameEditorProps {
  boardId: string
  list: BoardListResponse
  onDone: () => void
}

function ColumnNameEditor({ boardId, list, onDone }: ColumnNameEditorProps) {
  const [name, setName] = useState(list.name)
  const updateList = useUpdateList(boardId)

  function submit() {
    const trimmed = name.trim()

    if (!trimmed || trimmed === list.name) {
      onDone()
      return
    }

    updateList.mutate(
      { listId: list.id, name: trimmed },
      { onSuccess: onDone }
    )
  }

  return (
    <Input
      autoFocus
      className="h-7"
      value={name}
      disabled={updateList.isPending}
      aria-label={`Novo nome da lista ${list.name}`}
      onChange={(event) => setName(event.target.value)}
      onBlur={submit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          submit()
        }

        if (event.key === "Escape") {
          onDone()
        }
      }}
    />
  )
}
