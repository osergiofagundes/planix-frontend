import { z } from "zod"

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "Informe o novo e-mail.")
    .max(255, "O e-mail deve ter no máximo 255 caracteres.")
    .pipe(z.email("Digite um e-mail válido.")),
  currentPassword: z.string().min(1, "Informe sua senha atual."),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    confirmPassword: z.string().min(1, "Repita a nova senha."),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "A nova senha precisa ser diferente da atual.",
    path: ["newPassword"],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })

export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
