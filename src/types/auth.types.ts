export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

export interface UserResponse {
  id: number
  name: string
  email: string
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"
