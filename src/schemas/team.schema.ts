import { z } from "zod"

export const TEAM_DESCRIPTION_MAX = 2000

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  description: z
    .string()
    .trim()
    .max(
      TEAM_DESCRIPTION_MAX,
      `A descrição deve ter no máximo ${TEAM_DESCRIPTION_MAX} caracteres.`
    ),
  icon: z.string().trim().min(1).nullable(),
})

export type TeamFormValues = z.infer<typeof teamSchema>
