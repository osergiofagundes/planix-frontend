import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { normalizeApiError } from "@/api/api-error"
import { toastApiError } from "@/lib/api-feedback"
import { writeCardToCaches } from "@/lib/card-cache"
import { toCardUpdateRequest } from "@/lib/card-update"
import { queryKeys } from "@/lib/query-client"
import { cardService } from "@/services/card.service"
import type { CardResponse, CardUpdateRequest } from "@/types/card.types"

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.detail(cardId ?? ""),
    queryFn: () => cardService.getById(cardId!),
    enabled: Boolean(cardId),
  })
}

export function useCardChanges(cardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.cards.changes(cardId ?? ""),
    queryFn: () => cardService.changes(cardId!),
    enabled: Boolean(cardId) && enabled,
  })
}

export function useUpdateCard(card: CardResponse | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: Partial<CardUpdateRequest>) => {
      if (!card) {
        throw new Error("Cartão ainda não carregado.")
      }

      return cardService.update(card.id, toCardUpdateRequest(card, patch))
    },
    onSuccess: (updated) => writeCardToCaches(queryClient, updated),
    onError: (error) =>
      toastApiError(error, "Não foi possível salvar o cartão"),
  })
}

export function useToggleCardComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cardId,
      completed,
    }: {
      cardId: number
      completed: boolean
    }) => cardService.setCompleted(cardId, { completed }),
    onSuccess: (updated) => writeCardToCaches(queryClient, updated),
    onError: (error) =>
      toastApiError(error, "Não foi possível alterar a conclusão do cartão"),
  })
}

export function useToggleCardLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cardId,
      labelId,
      attached,
    }: {
      cardId: number
      labelId: number
      attached: boolean
    }) => {
      if (attached) {
        await cardService.removeLabel(cardId, labelId)
      } else {
        await cardService.addLabel(cardId, labelId)
      }

      return cardService.getById(cardId)
    },
    onSuccess: (updated) => writeCardToCaches(queryClient, updated),
    onError: (error) =>
      toastApiError(error, "Não foi possível alterar a etiqueta"),
  })
}

export function useToggleCardAssignee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cardId,
      userId,
      assigned,
    }: {
      cardId: number
      userId: number
      assigned: boolean
    }) => {
      if (assigned) {
        await cardService.removeAssignee(cardId, userId)
      } else {
        await cardService.addAssignee(cardId, userId)
      }

      return cardService.getById(cardId)
    },
    onSuccess: (updated) => writeCardToCaches(queryClient, updated),
    onError: (error, { cardId }) => {
      if (normalizeApiError(error).status === 409) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cards.detail(cardId),
        })
        return
      }

      toastApiError(error, "Não foi possível alterar o responsável")
    },
  })
}
