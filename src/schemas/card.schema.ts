import { z } from "zod"

import { CARD_PRIORITIES } from "@/types/card.types"

export const cardTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O título é obrigatório.")
    .max(200, "O título deve ter no máximo 200 caracteres."),
})

export const cardDescriptionSchema = z.object({
  description: z
    .string()
    .trim()
    .max(5000, "A descrição deve ter no máximo 5000 caracteres."),
})

export const cardPrioritySchema = z.enum(CARD_PRIORITIES)

export const checklistItemSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Escreva o item.")
    .max(300, "O item deve ter no máximo 300 caracteres."),
})

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Escreva um comentário.")
    .max(5000, "O comentário deve ter no máximo 5000 caracteres."),
})

export const cardLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Informe o endereço.")
    .max(2000, "O endereço deve ter no máximo 2000 caracteres.")
    .pipe(z.url("Informe um endereço completo, começando com http:// ou https://.")),
  title: z
    .string()
    .trim()
    .max(200, "O rótulo deve ter no máximo 200 caracteres."),
})

export type CardTitleFormValues = z.infer<typeof cardTitleSchema>
export type CardDescriptionFormValues = z.infer<typeof cardDescriptionSchema>
export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
export type CardLinkFormValues = z.infer<typeof cardLinkSchema>
