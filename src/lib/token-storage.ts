import type { AuthResponse } from "@/types/auth.types"

const ACCESS_TOKEN_KEY = "planix.accessToken"
const REFRESH_TOKEN_KEY = "planix.refreshToken"

export const AUTH_LOGOUT_EVENT = "planix:auth-logout"

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage indisponível (modo privado, cota estourada): a sessão passa
    // a valer só para esta aba, o que é melhor do que derrubar o login inteiro.
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Se não deu para gravar, também não vai dar para apagar. Ignorar é seguro.
  }
}

export const tokenStorage = {
  getAccessToken: () => read(ACCESS_TOKEN_KEY),

  getRefreshToken: () => read(REFRESH_TOKEN_KEY),

  setTokens: ({ accessToken, refreshToken }: AuthResponse) => {
    write(ACCESS_TOKEN_KEY, accessToken)
    write(REFRESH_TOKEN_KEY, refreshToken)
  },

  clear: () => {
    remove(ACCESS_TOKEN_KEY)
    remove(REFRESH_TOKEN_KEY)
  },

  hasSession: () => read(ACCESS_TOKEN_KEY) !== null,
}

export function emitAuthLogout(): void {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
}
