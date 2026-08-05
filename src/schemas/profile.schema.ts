import { z } from "zod"

import { countDigits, phoneDigitCount } from "@/lib/masks"

export const BIO_MAX = 1000

const NUMBER_PATTERN = /^\d*$/
const STATE_PATTERN = /^([A-Za-z]{2})?$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00`)

  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now()
}

const addressSchema = z.object({
  street: z.string().trim().max(150, "O logradouro deve ter no máximo 150 caracteres."),
  number: z
    .string()
    .trim()
    .max(20, "O número deve ter no máximo 20 caracteres.")
    .regex(NUMBER_PATTERN, "O número do endereço aceita apenas dígitos."),
  complement: z
    .string()
    .trim()
    .max(100, "O complemento deve ter no máximo 100 caracteres."),
  city: z.string().trim().max(100, "A cidade deve ter no máximo 100 caracteres."),
  state: z
    .string()
    .trim()
    .regex(STATE_PATTERN, "Use a sigla do estado, com duas letras."),
  zipCode: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || countDigits(value) === 8,
      "O CEP precisa ter 8 dígitos."
    ),
})

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  birthDate: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || ISO_DATE_PATTERN.test(value),
      "Informe uma data válida."
    )
    .refine(
      (value) => value === "" || isRealDate(value),
      "A data de nascimento não pode estar no futuro."
    ),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = phoneDigitCount(value)

      return digits === 0 || digits === 12 || digits === 13
    }, "Informe o telefone completo com DDD."),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX, `A biografia deve ter no máximo ${BIO_MAX} caracteres.`),
  address: addressSchema,
})

export const socialLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Informe o endereço do perfil.")
    .max(255, "O endereço deve ter no máximo 255 caracteres.")
    .regex(/^https?:\/\/.+/, "O endereço deve começar com http:// ou https://."),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>
