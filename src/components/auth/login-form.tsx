import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { FormErrorAlert } from "@/components/form-error-alert"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useLogin } from "@/hooks/use-login"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { PATHS } from "@/routes/paths"
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema"

const LOGIN_FIELDS = ["email", "password"] as const

export function LoginForm() {
  const login = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const { errors } = form.formState
  const apiError = login.error ? normalizeApiError(login.error) : null

  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onError: (error) => {
        applyApiFieldErrors(
          normalizeApiError(error),
          form.setError,
          LOGIN_FIELDS
        )
      },
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Informe suas credenciais</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FormErrorAlert
              error={alertError}
              title="Não foi possível entrar"
            />

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email" required>
                E-mail
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@exemplo.com"
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password" required>
                Senha
              </FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending && <Spinner data-icon="inline-start" />}
              {login.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Não tem conta?{" "}
          <Link
            to={PATHS.register}
            className="font-medium text-foreground hover:text-primary"
          >
            Criar conta
          </Link>
        </p>
      </CardContent>
    </>
  )
}
