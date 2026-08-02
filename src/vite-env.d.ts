/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da Planix API, ex.: http://localhost:8080 */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
