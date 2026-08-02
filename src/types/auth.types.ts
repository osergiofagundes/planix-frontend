/** Tipos do domínio de autenticação, espelhando os schemas do `JAVA_API/api.json`. */

/** Schema `RegisterRequest`. */
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

/** Schema `LoginRequest`. */
export interface LoginRequest {
  email: string
  password: string
}

/** Schema `RefreshRequest` — também usado no logout. */
export interface RefreshRequest {
  refreshToken: string
}

/** Schema `AuthResponse` — devolvido por register, login e refresh. */
export interface AuthResponse {
  accessToken: string
  /** String opaca de uso único: a cada refresh o backend devolve uma nova. */
  refreshToken: string
  expiresInSeconds: number
}

/** Schema `UserResponse`. */
export interface UserResponse {
  id: number
  name: string
  email: string
}

/** Estado da sessão no cliente. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated"
