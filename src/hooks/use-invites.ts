import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { inviteService } from "@/services/invite.service"
import type { InviteRequest } from "@/types/invite.types"

export function useTeamInvites(teamId: string | number | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams.invites(teamId ?? ""),
    queryFn: () => inviteService.listByTeam(teamId!),
    enabled: Boolean(teamId) && enabled,
  })
}

export function useCreateInvite(teamId: string | number) {
  return useMutation({
    mutationFn: (payload: InviteRequest) => inviteService.create(teamId, payload),
    onError: (error) => toastApiError(error, "Não foi possível gerar o convite"),
  })
}

export function useRevokeInvite(teamId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => inviteService.revoke(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invites(teamId),
      })
      toastSuccess("Convite revogado.", "O convite não será mais aceito.")
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível revogar o convite"),
  })
}

export function useInvitePreview() {
  return useMutation({
    mutationFn: (token: string) => inviteService.preview(token),
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => inviteService.accept(token),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team)
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      // Entrar na equipe já dá acesso aos quadros abertos dela.
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Você entrou na equipe.", team.name)
    },
    onError: (error) => toastApiError(error, "Não foi possível aceitar o convite"),
  })
}
