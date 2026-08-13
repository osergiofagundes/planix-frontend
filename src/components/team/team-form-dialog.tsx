import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { BoardIconPicker } from "@/components/board/board-icon-picker"
import { FormErrorAlert } from "@/components/common/form-error-alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useCreateTeam, useUpdateTeam } from "@/hooks/use-teams"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  TEAM_DESCRIPTION_MAX,
  teamSchema,
  type TeamFormValues,
} from "@/schemas/team.schema"
import type { TeamResponse } from "@/types/team.types"

const TEAM_FIELDS = ["name", "description", "icon"] as const

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: TeamResponse
  onCreated?: (team: TeamResponse) => void
}

export function TeamFormDialog({
  open,
  onOpenChange,
  team,
  onCreated,
}: TeamFormDialogProps) {
  const isEditing = Boolean(team)

  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam(team?.id ?? 0)
  const mutation = isEditing ? updateTeam : createTeam

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", description: "", icon: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: team?.name ?? "",
        description: team?.description ?? "",
        icon: team?.icon ?? null,
      })
      mutation.reset()
    }
  }, [open, team])

  const description =
    useWatch({ control: form.control, name: "description" }) ?? ""
  const errors = form.formState.errors

  const apiError = mutation.error ? normalizeApiError(mutation.error) : null
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: TeamFormValues) {
    mutation.mutate(
      {
        name: values.name,
        description: values.description || null,
        icon: values.icon || null,
      },
      {
        onSuccess: (saved) => {
          onOpenChange(false)

          if (!isEditing) {
            onCreated?.(saved)
          }
        },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar equipe" : "Nova equipe"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere o nome e a descrição desta equipe."
              : "Uma equipe reúne as pessoas e os quadros de uma empresa ou de um grupo. Você entra como dono e convida os outros depois."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
              <FieldLabel htmlFor="team-name" required>
                Nome da equipe
              </FieldLabel>
              <Input
                id="team-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                placeholder="Nome da equipe *"
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="team-description">Descrição</FieldLabel>
              <Textarea
                id="team-description"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                placeholder="Descrição da equipe"
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

          <DialogFooter className="mt-6">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={mutation.isPending}
            >
              Cancelar
            </DialogClose>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner data-icon="inline-start" />}
              {mutation.isPending
                ? "Salvando…"
                : isEditing
                  ? "Salvar alterações"
                  : "Criar equipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
