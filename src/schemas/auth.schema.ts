import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .pipe(z.email("Digite um e-mail válido.")),
  password: z.string().min(1, "Informe sua senha."),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe seu nome.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .max(255, "O e-mail deve ter no máximo 255 caracteres.")
    .pipe(z.email("Digite um e-mail válido.")),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
