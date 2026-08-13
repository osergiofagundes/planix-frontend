import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { FormErrorAlert } from "@/components/common/form-error-alert"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useRegister } from "@/hooks/use-register"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { PATHS } from "@/routes/paths"
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema"

const REGISTER_FIELDS = ["name", "email", "password"] as const

const EMAIL_ALREADY_TAKEN = 409

export function RegisterForm() {
  const register = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const { errors } = form.formState
  const apiError = register.error ? normalizeApiError(register.error) : null
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: RegisterFormValues) {
    register.mutate(values, {
      onError: (error) => {
        applyApiFieldErrors(
          normalizeApiError(error),
          form.setError,
          REGISTER_FIELDS
        )
      },
    })
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para criar sua conta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FormErrorAlert
              error={alertError}
              title="Não foi possível criar a conta"
            >
              {alertError?.status === EMAIL_ALREADY_TAKEN && (
                <Link to={PATHS.login}>Entrar com esse e-mail</Link>
              )}
            </FormErrorAlert>

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name" required>
                Nome
              </FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Seu nome"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

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
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                invalid={Boolean(errors.password)}
                {...form.register("password")}
              />
              {errors.password ? (
                <FieldError errors={[errors.password]} />
              ) : (
                <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending && <Spinner data-icon="inline-start" />}
              {register.isPending ? "Criando conta…" : "Criar conta"}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link
            to={PATHS.login}
            className="font-medium text-foreground hover:text-primary"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </>
  )
}
