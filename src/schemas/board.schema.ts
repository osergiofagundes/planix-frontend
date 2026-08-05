import { z } from "zod"

export const BOARD_DESCRIPTION_MAX = 2000

export const boardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  description: z
    .string()
    .trim()
    .max(
      BOARD_DESCRIPTION_MAX,
      `A descrição deve ter no máximo ${BOARD_DESCRIPTION_MAX} caracteres.`
    ),
})

export const boardListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da lista é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
})

export const labelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da etiqueta é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  color: z.string().min(1, "Escolha uma cor."),
})

export type BoardFormValues = z.infer<typeof boardSchema>
export type BoardListFormValues = z.infer<typeof boardListSchema>
export type LabelFormValues = z.infer<typeof labelSchema>
