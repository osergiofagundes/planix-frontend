import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { toastApiError, toastSuccess } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { profileService } from "@/services/profile.service"
import type {
  ProfileRequest,
  ProfileResponse,
  SocialPlatform,
} from "@/types/profile.types"

export function useProfile() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.me.profile,
    queryFn: profileService.get,
    enabled: isAuthenticated,
  })
}

export function useAvatarImage(avatarUrl: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.avatars.detail(avatarUrl ?? ""),
    queryFn: () => profileService.fetchAvatarImage(avatarUrl!),
    enabled: Boolean(avatarUrl),
    staleTime: Infinity,
  })
}

function useProfileCache() {
  const queryClient = useQueryClient()

  return {
    save(profile: ProfileResponse) {
      queryClient.setQueryData(queryKeys.me.profile, profile)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
    refreshAvatars() {
      queryClient.invalidateQueries({ queryKey: queryKeys.avatars.all })
    },
    refreshProfile() {
      queryClient.invalidateQueries({ queryKey: queryKeys.me.profile })
    },
  }
}

export function useUpdateProfile() {
  const cache = useProfileCache()

  return useMutation({
    mutationFn: (payload: ProfileRequest) => profileService.update(payload),
    onSuccess: (profile) => {
      cache.save(profile)
      toastSuccess("Perfil atualizado.")
    },
  })
}

export function useUploadAvatar() {
  const cache = useProfileCache()
  const [progress, setProgress] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: (file: File) =>
      profileService.uploadAvatar(file, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      }),
    onMutate: () => setProgress(0),
    onSuccess: (profile) => {
      cache.refreshAvatars()
      cache.save(profile)
      toastSuccess("Foto atualizada.")
    },
    onError: (error) => toastApiError(error, "Não foi possível enviar a foto"),
    onSettled: () => setProgress(null),
  })

  return { ...mutation, progress }
}

export function useDeleteAvatar() {
  const cache = useProfileCache()

  return useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      cache.refreshAvatars()
      cache.refreshProfile()
      toastSuccess("Foto removida.")
    },
    onError: (error) => toastApiError(error, "Não foi possível remover a foto"),
  })
}

export function useUpsertSocialLink() {
  const cache = useProfileCache()

  return useMutation({
    mutationFn: ({ platform, url }: { platform: SocialPlatform; url: string }) =>
      profileService.upsertSocialLink(platform, url),
    onSuccess: () => {
      cache.refreshProfile()
      toastSuccess("Rede social salva.")
    },
  })
}

export function useDeleteSocialLink() {
  const cache = useProfileCache()

  return useMutation({
    mutationFn: (platform: SocialPlatform) =>
      profileService.deleteSocialLink(platform),
    onSuccess: () => {
      cache.refreshProfile()
      toastSuccess("Rede social removida.")
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível remover a rede social"),
  })
}
