import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { FormErrorAlert } from "@/components/form-error-alert"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useChangePassword } from "@/hooks/use-profile"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/schemas/security.schema"

const PASSWORD_FIELDS = ["currentPassword", "newPassword"] as const

export function PasswordChangeForm({ onDone }: { onDone: () => void }) {
  const changePassword = useChangePassword()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { errors } = form.formState
  const apiError = changePassword.error
    ? normalizeApiError(changePassword.error)
    : null

  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: onDone,
        onError: (error) => {
          applyApiFieldErrors(
            normalizeApiError(error),
            form.setError,
            PASSWORD_FIELDS
          )
        },
      }
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormErrorAlert
          error={alertError}
          title="Não foi possível trocar a senha"
        />

        <Field data-invalid={Boolean(errors.currentPassword)}>
          <FieldLabel htmlFor="current-password" required>
            Senha atual
          </FieldLabel>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(errors.currentPassword)}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <Field data-invalid={Boolean(errors.newPassword)}>
          <FieldLabel htmlFor="new-password" required>
            Nova senha
          </FieldLabel>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(errors.newPassword)}
            {...form.register("newPassword")}
          />
          {errors.newPassword ? (
            <FieldError errors={[errors.newPassword]} />
          ) : (
            <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirm-password" required>
            Confirmar nova senha
          </FieldLabel>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(errors.confirmPassword)}
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDone}
            disabled={changePassword.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={changePassword.isPending}>
            {changePassword.isPending && <Spinner data-icon="inline-start" />}
            {changePassword.isPending ? "Atualizando…" : "Atualizar senha"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
