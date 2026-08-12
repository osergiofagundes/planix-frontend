import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { BoardIconPicker } from "@/components/board/board-icon-picker"
import { FormErrorAlert } from "@/components/common/form-error-alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea"
import { useUpdateTeam } from "@/hooks/use-teams"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  TEAM_DESCRIPTION_MAX,
  teamSchema,
  type TeamFormValues,
} from "@/schemas/team.schema"
import type { TeamResponse } from "@/types/team.types"

const TEAM_FIELDS = ["name", "description", "icon"] as const

export function TeamGeneralTab({ team }: { team: TeamResponse }) {
  const updateTeam = useUpdateTeam(team.id)

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    values: {
      name: team.name,
      description: team.description ?? "",
      icon: team.icon ?? null,
    },
  })

  const description = useWatch({ control: form.control, name: "description" }) ?? ""
  const errors = form.formState.errors

  const apiError = updateTeam.error ? normalizeApiError(updateTeam.error) : null
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: TeamFormValues) {
    updateTeam.mutate(
      {
        name: values.name,
        description: values.description || null,
        icon: values.icon || null,
      },
      {
        onError: (error) => {
          applyApiFieldErrors(
            normalizeApiError(error),
            form.setError,
            TEAM_FIELDS
          )
        },
      }
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>
            Como esta equipe aparece para você e para quem participa dela.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <FormErrorAlert
              error={alertError}
              title="Não foi possível salvar a equipe"
            />

            <Field data-invalid={Boolean(errors.icon)}>
              <FieldLabel>Ícone</FieldLabel>
              <Controller
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <BoardIconPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.icon]} />
            </Field>

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="settings-team-name" required>
                Nome da equipe
              </FieldLabel>
              <Input
                id="settings-team-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="settings-team-description">
                Descrição
              </FieldLabel>
              <Textarea
                id="settings-team-description"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...form.register("description")}
              />
              {errors.description ? (
                <FieldError errors={[errors.description]} />
              ) : (
                <FieldDescription>
                  {description.length} / {TEAM_DESCRIPTION_MAX}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || updateTeam.isPending}
          >
            {updateTeam.isPending && <Spinner data-icon="inline-start" />}
            Salvar alterações
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
