export const SOCIAL_PLATFORMS = [
  "LINKEDIN",
  "X",
  "INSTAGRAM",
  "GITHUB",
  "FACEBOOK",
  "YOUTUBE",
  "WEBSITE",
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export interface SocialLinkResponse {
  platform: SocialPlatform
  url: string
}

export interface AddressRequest {
  street: string | null
  number: string | null
  complement: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export interface AddressResponse {
  street: string | null
  number: string | null
  complement: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export interface ProfileRequest {
  name: string
  birthDate: string | null
  phone: string | null
  bio: string | null
  address: AddressRequest | null
}

/** Limite do avatar já recortado, igual ao do backend. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024

/** Limite da imagem que a pessoa escolhe antes do recorte: ela pode subir uma
 * foto grande e recortar um pedaço pequeno, então a folga aqui é maior. */
export const MAX_AVATAR_SOURCE_BYTES = 20 * 1024 * 1024

export const ACCEPTED_AVATAR_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export interface ProfileResponse {
  id: number
  name: string
  email: string
  birthDate: string | null
  phone: string | null
  bio: string | null
  avatarUrl: string | null
  address: AddressResponse | null
  socialLinks: SocialLinkResponse[]
}
