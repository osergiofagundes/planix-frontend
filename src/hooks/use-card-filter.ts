import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import {
  EMPTY_CARD_FILTER,
  isCardPriority,
  type CardFilter,
} from "@/lib/card-filter"

const PARAM = {
  search: "q",
  assignee: "assignee",
  label: "label",
  priority: "priority",
  hideCompleted: "done",
} as const

function readIds(params: URLSearchParams, key: string): number[] {
  return params
    .getAll(key)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value))
}

export function useCardFilter() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filter = useMemo<CardFilter>(
    () => ({
      search: searchParams.get(PARAM.search) ?? EMPTY_CARD_FILTER.search,
      assigneeIds: readIds(searchParams, PARAM.assignee),
      labelIds: readIds(searchParams, PARAM.label),
      priorities: searchParams.getAll(PARAM.priority).filter(isCardPriority),
      hideCompleted: searchParams.get(PARAM.hideCompleted) === "hide",
    }),
    [searchParams]
  )

  const setFilter = useCallback(
    (next: CardFilter) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)

          for (const key of Object.values(PARAM)) {
            params.delete(key)
          }

          if (next.search.trim()) {
            params.set(PARAM.search, next.search.trim())
          }

          for (const id of next.assigneeIds) {
            params.append(PARAM.assignee, String(id))
          }

          for (const id of next.labelIds) {
            params.append(PARAM.label, String(id))
          }

          for (const priority of next.priorities) {
            params.append(PARAM.priority, priority)
          }

          if (next.hideCompleted) {
            params.set(PARAM.hideCompleted, "hide")
          }

          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const clearFilter = useCallback(
    () => setFilter(EMPTY_CARD_FILTER),
    [setFilter]
  )

  return { filter, setFilter, clearFilter }
}
