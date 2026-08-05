export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string> | null
}

export interface NormalizedApiError {
  status: number
  message: string
  fieldErrors: Record<string, string>
  isNetworkError: boolean
}
