import { api } from "@/api/http"
import { API_ENDPOINTS } from "@/api/endpoints"
import type {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth.types"

export const authService = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      payload
    )
    return data
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      payload
    )
    return data
  },

  async logout(payload: RefreshRequest): Promise<void> {
    await api.post(API_ENDPOINTS.auth.logout, payload)
  },

  async logoutAll(): Promise<void> {
    await api.post(API_ENDPOINTS.auth.logoutAll)
  },

  async me(): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(API_ENDPOINTS.auth.me)
    return data
  },
}
