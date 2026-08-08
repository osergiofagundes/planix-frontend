import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { BoardIconPicker } from "@/components/board/board-icon-picker"
import { FormErrorAlert } from "@/components/form-error-alert"
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
import { useCreateBoard, useUpdateBoard } from "@/hooks/use-boards"
import { applyApiFieldErrors } from "@/lib/form-errors"
import {
  BOARD_DESCRIPTION_MAX,
  boardSchema,
  type BoardFormValues,
} from "@/schemas/board.schema"
import type { BoardResponse } from "@/types/board.types"

const BOARD_FIELDS = ["name", "description", "icon"] as const

interface BoardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  board?: BoardResponse
  onCreated?: (board: BoardResponse) => void
}

export function BoardFormDialog({
  open,
  onOpenChange,
  board,
  onCreated,
}: BoardFormDialogProps) {
  const isEditing = Boolean(board)

  const createBoard = useCreateBoard()
  const updateBoard = useUpdateBoard(board?.id ?? 0)
  const mutation = isEditing ? updateBoard : createBoard

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: { name: "", description: "", icon: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: board?.name ?? "",
        description: board?.description ?? "",
        icon: board?.icon ?? null,
      })
      mutation.reset()
    }
  }, [open, board])

  const description = useWatch({ control: form.control, name: "description" }) ?? ""
  const errors = form.formState.errors

  const apiError = mutation.error ? normalizeApiError(mutation.error) : null
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: BoardFormValues) {
    const payload = {
      name: values.name,
      description: values.description || null,
      icon: values.icon || null,
    }

    mutation.mutate(payload, {
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
          BOARD_FIELDS
        )
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar quadro" : "Novo quadro"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere o nome e a descrição deste quadro."
              : "Dê um nome ao quadro. A descrição é opcional e pode entrar depois."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
              <FieldLabel htmlFor="board-name" required>
                Nome do quadro
              </FieldLabel>
              <Input
                id="board-name"
                autoComplete="off"
                aria-invalid={Boolean(errors.name)}
                placeholder="Nome do quadro *"
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="board-description">Descrição</FieldLabel>
              <Textarea
                id="board-description"
                rows={4}
                aria-invalid={Boolean(errors.description)}
                placeholder="Descrição do quadro"
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
                  : "Criar quadro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
