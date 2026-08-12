import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { teamService } from "@/services/team.service"
import type { TeamRequest, TeamRole } from "@/types/team.types"

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: teamService.list,
  })
}

export function useTeamMembers(teamId: string | number | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId ?? ""),
    queryFn: () => teamService.members(teamId!),
    enabled: Boolean(teamId),
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TeamRequest) => teamService.create(payload),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team)
      toastSuccess("Equipe criada.", team.name)
    },
  })
}

export function useUpdateTeam(teamId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TeamRequest) => teamService.update(teamId, payload),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team)
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      toastSuccess("Equipe atualizada.")
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      confirmationName,
    }: {
      teamId: string | number
      confirmationName?: string
    }) => teamService.remove(teamId, confirmationName),
    onSuccess: (_data, { teamId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.teams.detail(teamId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Equipe excluída.")
    },
    onError: (error) => toastApiError(error, "Não foi possível excluir a equipe"),
  })
}

export function useChangeTeamRole(teamId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: number
      role: Exclude<TeamRole, "OWNER">
    }) => teamService.changeRole(teamId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      })
      toastSuccess("Papel atualizado.")
    },
    onError: (error) => toastApiError(error, "Não foi possível mudar o papel"),
  })
}

export function useRemoveTeamMember(teamId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => teamService.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      })
      // A pessoa sai também dos quadros da equipe e dos cartões deles.
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Membro removido da equipe.")
    },
    onError: (error) => toastApiError(error, "Não foi possível remover o membro"),
  })
}

export function useLeaveTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teamId: string | number) => teamService.leave(teamId),
    onSuccess: (_data, teamId) => {
      queryClient.removeQueries({ queryKey: queryKeys.teams.detail(teamId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      toastSuccess("Você saiu da equipe.")
    },
    onError: (error) => toastApiError(error, "Não foi possível sair da equipe"),
  })
}

export function useTransferTeamOwner(teamId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => teamService.transferOwner(teamId, userId),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team)
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      })
      toastSuccess("Posse transferida.", `Agora o dono é ${team.owner.name}.`)
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível transferir a posse"),
  })
}
