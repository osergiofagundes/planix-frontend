import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { hasFieldErrors, normalizeApiError } from "@/api/api-error"
import { useUpdateProfile } from "@/hooks/use-profile"
import { applyApiFieldErrors } from "@/lib/form-errors"
import { maskPhone, maskZipCode } from "@/lib/masks"
import { profileSchema, type ProfileFormValues } from "@/schemas/profile.schema"
import type { NormalizedApiError } from "@/types/api.types"
import type {
  AddressRequest,
  ProfileRequest,
  ProfileResponse,
} from "@/types/profile.types"

const PROFILE_FIELDS = [
  "name",
  "birthDate",
  "phone",
  "bio",
  "address.street",
  "address.number",
  "address.complement",
  "address.city",
  "address.state",
  "address.zipCode",
] as const

function toFormValues(profile: ProfileResponse): ProfileFormValues {
  return {
    name: profile.name,
    birthDate: profile.birthDate ?? "",
    phone: maskPhone(profile.phone ?? ""),
    bio: profile.bio ?? "",
    address: {
      street: profile.address?.street ?? "",
      number: profile.address?.number ?? "",
      complement: profile.address?.complement ?? "",
      city: profile.address?.city ?? "",
      state: profile.address?.state ?? "",
      zipCode: maskZipCode(profile.address?.zipCode ?? ""),
    },
  }
}

function emptyToNull(value: string): string | null {
  return value.trim() === "" ? null : value.trim()
}

function toPayload(values: ProfileFormValues): ProfileRequest {
  const address: AddressRequest = {
    street: emptyToNull(values.address.street),
    number: emptyToNull(values.address.number),
    complement: emptyToNull(values.address.complement),
    city: emptyToNull(values.address.city),
    state: emptyToNull(values.address.state)?.toUpperCase() ?? null,
    zipCode: emptyToNull(values.address.zipCode),
  }

  const hasAddress = Object.values(address).some((field) => field !== null)

  return {
    name: values.name.trim(),
    birthDate: emptyToNull(values.birthDate),
    phone: emptyToNull(values.phone),
    bio: emptyToNull(values.bio),
    address: hasAddress ? address : null,
  }
}

export interface ProfileFormController {
  form: UseFormReturn<ProfileFormValues>
  isPending: boolean
  alertError: NormalizedApiError | null
  submit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function useProfileForm(
  profile: ProfileResponse
): ProfileFormController {
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: toFormValues(profile),
  })

  const submit = form.handleSubmit((values) => {
    updateProfile.mutate(toPayload(values), {
      onError: (error) => {
        applyApiFieldErrors(normalizeApiError(error), form.setError, [
          ...PROFILE_FIELDS,
        ])
      },
    })
  })

  const apiError = updateProfile.error
    ? normalizeApiError(updateProfile.error)
    : null

  return {
    form,
    isPending: updateProfile.isPending,
    alertError: apiError && !hasFieldErrors(apiError) ? apiError : null,
    submit,
  }
}
