import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { cardLinkService } from "@/services/card-link.service"
import type { CardLinkRequest } from "@/types/card.types"

export function useCardLinks(cardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.links(cardId ?? ""),
    queryFn: () => cardLinkService.listByCard(cardId!),
    enabled: Boolean(cardId),
  })
}

export function useCreateCardLink(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CardLinkRequest) =>
      cardLinkService.create(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.links(cardId) })
    },
  })
}

export function useDeleteCardLink(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => cardLinkService.remove(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.links(cardId) })
    },
    onError: (error) => toastApiError(error, "Não foi possível remover o link"),
  })
}
