import type { AxiosProgressEvent } from "axios"

import { API_ENDPOINTS } from "@/api/endpoints"
import { api } from "@/api/http"
import type {
  AuthResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
} from "@/types/auth.types"
import type {
  ProfileRequest,
  ProfileResponse,
  SocialLinkResponse,
  SocialPlatform,
} from "@/types/profile.types"

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler a imagem."))
    reader.readAsDataURL(blob)
  })
}

export const profileService = {
  async get(): Promise<ProfileResponse> {
    const { data } = await api.get<ProfileResponse>(API_ENDPOINTS.me.profile)
    return data
  },

  async update(payload: ProfileRequest): Promise<ProfileResponse> {
    const { data } = await api.put<ProfileResponse>(
      API_ENDPOINTS.me.profile,
      payload
    )
    return data
  },

  async changeEmail(payload: ChangeEmailRequest): Promise<AuthResponse> {
    const { data } = await api.put<AuthResponse>(
      API_ENDPOINTS.me.email,
      payload
    )
    return data
  },

  async changePassword(payload: ChangePasswordRequest): Promise<AuthResponse> {
    const { data } = await api.put<AuthResponse>(
      API_ENDPOINTS.me.password,
      payload
    )
    return data
  },

  async uploadAvatar(
    file: File,
    onUploadProgress?: (event: AxiosProgressEvent) => void
  ): Promise<ProfileResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await api.post<ProfileResponse>(
      API_ENDPOINTS.me.avatar,
      formData,
      { headers: { "Content-Type": null }, onUploadProgress }
    )

    return data
  },

  async deleteAvatar(): Promise<void> {
    await api.delete(API_ENDPOINTS.me.avatar)
  },

  async upsertSocialLink(
    platform: SocialPlatform,
    url: string
  ): Promise<SocialLinkResponse> {
    const { data } = await api.put<SocialLinkResponse>(
      API_ENDPOINTS.me.socialLink(platform),
      { url }
    )
    return data
  },

  async deleteSocialLink(platform: SocialPlatform): Promise<void> {
    await api.delete(API_ENDPOINTS.me.socialLink(platform))
  },

  async fetchAvatarImage(avatarUrl: string): Promise<string> {
    const { data } = await api.get<Blob>(avatarUrl, { responseType: "blob" })
    return blobToDataUrl(data)
  },
}
