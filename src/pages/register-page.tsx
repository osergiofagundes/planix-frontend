import { RegisterForm } from "@/components/auth/register-form"
import { Card } from "@/components/ui/card"
import { AuthLayout } from "@/layouts/auth-layout"

export function RegisterPage() {
  return (
    <AuthLayout
      title="Comece pelo primeiro quadro."
      description="Crie sua conta, monte as colunas do fluxo e convide o time com um link."
    >
      <Card>
        <RegisterForm />
      </Card>
    </AuthLayout>
  )
}
