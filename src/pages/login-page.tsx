import { LoginForm } from "@/components/auth/login-form"
import { Card } from "@/components/ui/card"
import { AuthLayout } from "@/layouts/auth-layout"

export function LoginPage() {
  return (
    <AuthLayout
      title="O projeto inteiro em uma tela."
      description="Quadros, listas e cartões com etiquetas, prazos, checklists e histórico. Sem planilha paralela, sem thread perdida."
    >
      <Card>
        <LoginForm />
      </Card>
    </AuthLayout>
  )
}
