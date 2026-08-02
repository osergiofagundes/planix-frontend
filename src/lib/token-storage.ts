import type { AuthResponse } from "@/types/auth.types"

/**
 * Persistência do par de tokens em `localStorage`.
 *
 * A API devolve os tokens no corpo da resposta (não em cookie httpOnly), então
 * guardá-los aqui é o que permite a sessão sobreviver a um F5.
 *
 * Só o `http.ts` e o provider de auth devem escrever aqui.
 */

const ACCESS_TOKEN_KEY = "planix.accessToken"
const REFRESH_TOKEN_KEY = "planix.refreshToken"

/** Evento emitido quando a sessão cai de forma involuntária (refresh recusado). */
export const AUTH_LOGOUT_EVENT = "planix:auth-logout"

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Modo privativo em alguns navegadores derruba o acesso ao storage.
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Sem storage a sessão vive só em memória — não é motivo para quebrar a app.
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Idem.
  }
}

export const tokenStorage = {
  getAccessToken: () => read(ACCESS_TOKEN_KEY),

  getRefreshToken: () => read(REFRESH_TOKEN_KEY),

  /** Grava o par recebido de register/login/refresh. */
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

/** Avisa a aplicação que a sessão expirou. Quem escuta é o `AuthProvider`. */
export function emitAuthLogout(): void {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
}
