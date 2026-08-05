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
