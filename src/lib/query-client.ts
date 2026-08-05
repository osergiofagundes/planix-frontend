import { QueryClient } from "@tanstack/react-query"

import { AxiosError } from "axios"

type Id = number | string

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  me: {
    profile: ["me", "profile"] as const,
  },
  avatars: {
    all: ["avatars"] as const,
    detail: (url: string) => ["avatars", url] as const,
  },
  boards: {
    all: ["boards"] as const,
    detail: (boardId: Id) => ["boards", String(boardId)] as const,
    lists: (boardId: Id) => ["boards", String(boardId), "lists"] as const,
    labels: (boardId: Id) => ["boards", String(boardId), "labels"] as const,
    members: (boardId: Id) => ["boards", String(boardId), "members"] as const,
    invites: (boardId: Id) => ["boards", String(boardId), "invites"] as const,
  },
  lists: {
    cards: (listId: Id) => ["lists", String(listId), "cards"] as const,
  },
  cards: {
    detail: (cardId: Id) => ["cards", String(cardId)] as const,
    checklist: (cardId: Id) => ["cards", String(cardId), "checklist"] as const,
    comments: (cardId: Id) => ["cards", String(cardId), "comments"] as const,
    links: (cardId: Id) => ["cards", String(cardId), "links"] as const,
    attachments: (cardId: Id) =>
      ["cards", String(cardId), "attachments"] as const,
    changes: (cardId: Id) => ["cards", String(cardId), "changes"] as const,
  },
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    if (status !== undefined && status >= 400 && status < 500) {
      return false
    }
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
