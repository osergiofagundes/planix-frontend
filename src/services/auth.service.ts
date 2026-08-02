import { api } from "@/api/http"
import { API_ENDPOINTS } from "@/api/endpoints"
import type {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth.types"

/**
 * Chamadas puras ao domínio de autenticação.
 * Sem estado, sem React: quem cuida de cache e de navegação são os hooks.
 */
export const authService = {
  /** Cria a conta e já devolve o par de tokens — não precisa chamar login depois. */
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

  /**
   * Revoga o refresh token deste dispositivo.
   * O access token atual segue válido até expirar — limitação do modelo stateless.
   */
  async logout(payload: RefreshRequest): Promise<void> {
    await api.post(API_ENDPOINTS.auth.logout, payload)
  },

  /** Revoga todos os refresh tokens ativos da conta. */
  async logoutAll(): Promise<void> {
    await api.post(API_ENDPOINTS.auth.logoutAll)
  },

  /** Dados da conta dona do token — usado para hidratar a sessão no boot. */
  async me(): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(API_ENDPOINTS.auth.me)
    return data
  },
}
