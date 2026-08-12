import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { FormErrorAlert } from "@/components/common/form-error-alert"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useChangeEmail } from "@/hooks/use-profile"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  changeEmailSchema,
  type ChangeEmailFormValues,
} from "@/schemas/security.schema"

const EMAIL_FIELDS = ["newEmail", "currentPassword"] as const

export function EmailChangeForm({ onDone }: { onDone: () => void }) {
  const changeEmail = useChangeEmail()

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", currentPassword: "" },
  })

  const { errors } = form.formState
  const apiError = changeEmail.error
    ? normalizeApiError(changeEmail.error)
    : null

  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: ChangeEmailFormValues) {
    changeEmail.mutate(values, {
      onSuccess: onDone,
      onError: (error) => {
        applyApiFieldErrors(
          normalizeApiError(error),
          form.setError,
          EMAIL_FIELDS
        )
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormErrorAlert
          error={alertError}
          title="Não foi possível trocar o e-mail"
        />

        <Field data-invalid={Boolean(errors.newEmail)}>
          <FieldLabel htmlFor="new-email" required>
            Novo e-mail
          </FieldLabel>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            placeholder="email@exemplo.com"
            aria-invalid={Boolean(errors.newEmail)}
            {...form.register("newEmail")}
          />
          <FieldError errors={[errors.newEmail]} />
        </Field>

        <Field data-invalid={Boolean(errors.currentPassword)}>
          <FieldLabel htmlFor="email-current-password" required>
            Senha atual
          </FieldLabel>
          <PasswordInput
            id="email-current-password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(errors.currentPassword)}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDone}
            disabled={changeEmail.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={changeEmail.isPending}>
            {changeEmail.isPending && <Spinner data-icon="inline-start" />}
            {changeEmail.isPending ? "Salvando…" : "Salvar e-mail"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
