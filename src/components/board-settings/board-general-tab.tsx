import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { BoardIconPicker } from "@/components/board/board-icon-picker"
import { BoardVisibilityField } from "@/components/board/board-visibility-field"
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
import { useUpdateBoard } from "@/hooks/use-boards"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  BOARD_DESCRIPTION_MAX,
  boardSchema,
  type BoardFormValues,
} from "@/schemas/board.schema"
import type { BoardResponse } from "@/types/board.types"

const BOARD_FIELDS = ["name", "description", "icon"] as const

export function BoardGeneralTab({ board }: { board: BoardResponse }) {
  const updateBoard = useUpdateBoard(board.id)

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    values: {
      name: board.name,
      description: board.description ?? "",
      icon: board.icon ?? null,
      visibility: board.visibility,
    },
  })

  const description = useWatch({ control: form.control, name: "description" }) ?? ""
  const errors = form.formState.errors

  const apiError = updateBoard.error ? normalizeApiError(updateBoard.error) : null
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: BoardFormValues) {
    updateBoard.mutate(
      {
        name: values.name,
        description: values.description || null,
        icon: values.icon || null,
        visibility: values.visibility,
      },
      {
        onError: (error) => {
          applyApiFieldErrors(
            normalizeApiError(error),
            form.setError,
            BOARD_FIELDS
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
            Como este quadro aparece para você e para os membros.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <FormErrorAlert
              error={alertError}
              title="Não foi possível salvar o quadro"
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
              <FieldLabel htmlFor="settings-board-name" required>
                Nome do quadro
              </FieldLabel>
              <Input
                id="settings-board-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="settings-board-description">
                Descrição
              </FieldLabel>
              <Textarea
                id="settings-board-description"
                rows={4}
                aria-invalid={Boolean(errors.description)}
                {...form.register("description")}
              />
              {errors.description ? (
                <FieldError errors={[errors.description]} />
              ) : (
                <FieldDescription>
                  {description.length} / {BOARD_DESCRIPTION_MAX}
                </FieldDescription>
              )}
            </Field>

            <Controller
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <BoardVisibilityField
                  id="settings-board-visibility"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || updateBoard.isPending}
          >
            {updateBoard.isPending && <Spinner data-icon="inline-start" />}
            Salvar alterações
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
