import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-provider"
import { queryClient } from "@/lib/query-client"
import { AppRoutes } from "@/routes/app-routes"

/**
 * A ordem dos providers importa: o `AuthProvider` usa `useNavigate` (precisa do
 * router) e `useQuery` (precisa do QueryClient), então fica dentro dos dois.
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
