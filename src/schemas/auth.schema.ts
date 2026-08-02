import { z } from "zod"

/**
 * Validação dos formulários de autenticação.
 *
 * As regras espelham as constraints do backend (`JAVA_API/api.json`) para que o
 * usuário receba o erro antes da requisição sair. O backend continua sendo a
 * autoridade — o que ele recusar volta em `fieldErrors` e é exibido no campo.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .pipe(z.email("Digite um e-mail válido, como voce@empresa.com.br.")),
  // Não replicamos a regra de tamanho da senha aqui: o backend responde a mesma
  // mensagem para senha errada e e-mail inexistente, de propósito. Antecipar
  // "mínimo 8 caracteres" no login só entregaria pista sobre a conta.
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
    .pipe(z.email("Digite um e-mail válido, como voce@empresa.com.br.")),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
