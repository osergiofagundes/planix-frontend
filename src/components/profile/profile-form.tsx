import { Controller, useWatch } from "react-hook-form"

import { FormErrorAlert } from "@/components/common/form-error-alert"
import { BirthDatePicker } from "@/components/profile/birth-date-picker"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ProfileFormController } from "@/hooks/use-profile-form"
import { BRAZILIAN_STATES } from "@/lib/brazilian-states"
import { maskPhone, maskZipCode, onlyDigits } from "@/lib/masks"
import { BIO_MAX } from "@/schemas/profile.schema"

const NO_STATE_LABEL = "Não informado"

const STATE_ITEMS = [
  { value: "", label: NO_STATE_LABEL },
  ...BRAZILIAN_STATES.map((state) => ({
    value: state.value,
    label: state.value,
  })),
]

interface ProfileFormProps {
  id: string
  controller: ProfileFormController
}

export function ProfileForm({ id, controller }: ProfileFormProps) {
  const { form, submit, alertError } = controller
  const errors = form.formState.errors

  const bio = useWatch({ control: form.control, name: "bio" }) ?? ""

  return (
    <form id={id} onSubmit={submit} noValidate className="flex flex-col gap-6">
      <FormErrorAlert
        error={alertError}
        title="Não foi possível salvar o perfil"
      />

      <FieldSet>
        <FieldLegend>Dados pessoais</FieldLegend>

        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="profile-name" required>
              Nome
            </FieldLabel>
            <Input
              id="profile-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.birthDate)}>
              <FieldLabel htmlFor="profile-birth-date">
                Data de nascimento
              </FieldLabel>
              <Controller
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <BirthDatePicker
                    id="profile-birth-date"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.birthDate)}
                  />
                )}
              />
              <FieldError errors={[errors.birthDate]} />
            </Field>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="profile-phone">Telefone</FieldLabel>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="profile-phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+55 (48) 99999-9999"
                    aria-invalid={Boolean(errors.phone)}
                    onChange={(event) =>
                      field.onChange(maskPhone(event.target.value))
                    }
                  />
                )}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.bio)}>
            <FieldLabel htmlFor="profile-bio">Sobre mim</FieldLabel>
            <Textarea
              id="profile-bio"
              rows={4}
              aria-invalid={Boolean(errors.bio)}
              {...form.register("bio")}
            />
            {errors.bio ? (
              <FieldError errors={[errors.bio]} />
            ) : (
              <FieldDescription>
                {bio.length} / {BIO_MAX}
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Endereço</FieldLegend>

        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
            <Field data-invalid={Boolean(errors.address?.street)}>
              <FieldLabel htmlFor="profile-street">Logradouro</FieldLabel>
              <Input
                id="profile-street"
                autoComplete="address-line1"
                aria-invalid={Boolean(errors.address?.street)}
                {...form.register("address.street")}
              />
              <FieldError errors={[errors.address?.street]} />
            </Field>

            <Field data-invalid={Boolean(errors.address?.number)}>
              <FieldLabel htmlFor="profile-number">Número</FieldLabel>
              <Controller
                control={form.control}
                name="address.number"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="profile-number"
                    className="sm:w-28"
                    inputMode="numeric"
                    maxLength={20}
                    aria-invalid={Boolean(errors.address?.number)}
                    onChange={(event) =>
                      field.onChange(onlyDigits(event.target.value))
                    }
                  />
                )}
              />
              <FieldError errors={[errors.address?.number]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.address?.complement)}>
            <FieldLabel htmlFor="profile-complement">Complemento</FieldLabel>
            <Input
              id="profile-complement"
              autoComplete="address-line2"
              aria-invalid={Boolean(errors.address?.complement)}
              {...form.register("address.complement")}
            />
            <FieldError errors={[errors.address?.complement]} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-[1fr_auto_auto]">
            <Field data-invalid={Boolean(errors.address?.city)}>
              <FieldLabel htmlFor="profile-city">Cidade</FieldLabel>
              <Input
                id="profile-city"
                autoComplete="address-level2"
                aria-invalid={Boolean(errors.address?.city)}
                {...form.register("address.city")}
              />
              <FieldError errors={[errors.address?.city]} />
            </Field>

            <Field data-invalid={Boolean(errors.address?.state)}>
              <FieldLabel htmlFor="profile-state">UF</FieldLabel>
              <Controller
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <Select
                    items={STATE_ITEMS}
                    value={field.value}
                    onValueChange={(value) => field.onChange(String(value))}
                  >
                    <SelectTrigger
                      id="profile-state"
                      className="sm:w-36"
                      aria-invalid={Boolean(errors.address?.state)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">{NO_STATE_LABEL}</SelectItem>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.address?.state]} />
            </Field>

            <Field data-invalid={Boolean(errors.address?.zipCode)}>
              <FieldLabel htmlFor="profile-zip-code">CEP</FieldLabel>
              <Controller
                control={form.control}
                name="address.zipCode"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="profile-zip-code"
                    className="sm:w-32"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="90000-000"
                    autoComplete="postal-code"
                    aria-invalid={Boolean(errors.address?.zipCode)}
                    onChange={(event) =>
                      field.onChange(maskZipCode(event.target.value))
                    }
                  />
                )}
              />
              <FieldError errors={[errors.address?.zipCode]} />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
