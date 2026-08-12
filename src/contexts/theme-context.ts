import { createContext } from "react"

/** Preferência escolhida. `system` acompanha o SO em tempo real. */
export type Theme = "dark" | "light" | "system"

/** O que de fato vai para a classe do `<html>` — `system` já resolvido. */
export type ResolvedTheme = "dark" | "light"

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
)
