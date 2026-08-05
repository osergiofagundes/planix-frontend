import { Outlet, useParams } from "react-router-dom"

import { normalizeApiError } from "@/api/api-error"
import { BoardCanvas } from "@/components/board/board-canvas"
import { BoardHeader } from "@/components/board/board-header"
import { BoardSettingsDialog } from "@/components/board-settings/board-settings-dialog"
import { ErrorState } from "@/components/error-state"
import { PageTopbar } from "@/components/layout/page-topbar"
import { Skeleton } from "@/components/ui/skeleton"
import { useBoard, useBoardMembers } from "@/hooks/use-boards"
import { useBoardCards } from "@/hooks/use-cards"
import { useCardFilter } from "@/hooks/use-card-filter"
import { useLists } from "@/hooks/use-lists"
import { filterCardsByList, isCardFilterActive } from "@/lib/card-filter"

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()

  const board = useBoard(boardId)
  const members = useBoardMembers(boardId)
  const lists = useLists(boardId)
  const { cardsByList, isLoading: isLoadingCards } = useBoardCards(lists.data)

  const { filter } = useCardFilter()
  const isFiltered = isCardFilterActive(filter)
  const visibleCardsByList = filterCardsByList(cardsByList, filter)

  if (board.isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState error={normalizeApiError(board.error)} />
      </div>
    )
  }

  if (board.isPending || !boardId) {
    return <BoardSkeleton />
  }

  return (
    <>
      <PageTopbar>
        <BoardHeader board={board.data} members={members.data ?? []} />
      </PageTopbar>

      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        {lists.isError ? (
          <ErrorState
            error={normalizeApiError(lists.error)}
            onRetry={() => lists.refetch()}
          />
        ) : lists.isPending ? (
          <BoardCanvasSkeleton />
        ) : (
          <BoardCanvas
            boardId={boardId}
            lists={lists.data}
            cardsByList={visibleCardsByList}
            allCardsByList={cardsByList}
            isLoadingCards={isLoadingCards}
            isFiltered={isFiltered}
          />
        )}
      </div>

      <BoardSettingsDialog board={board.data} />

      <Outlet />
    </>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-9 w-64" />
      <BoardCanvasSkeleton />
    </div>
  )
}

function BoardCanvasSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex w-72 shrink-0 flex-col gap-2 border bg-muted/40 p-2"
          >
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
