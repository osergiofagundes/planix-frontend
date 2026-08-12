import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { normalizeApiError } from "@/api/api-error"
import { ErrorState } from "@/components/common/error-state"
import { ProfileAvatarField } from "@/components/profile/profile-avatar-field"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileSecurity } from "@/components/profile/profile-security"
import { ProfileSocialLinks } from "@/components/profile/profile-social-links"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useProfile } from "@/hooks/use-profile"
import { useProfileForm } from "@/hooks/use-profile-form"
import type { ProfileResponse } from "@/types/profile.types"

export const PROFILE_PARAM = "perfil"

const FORM_ID = "profile-form"

const BODY_CLASS =
  "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-4 sm:p-6"

export function ProfileDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const profile = useProfile()

  if (searchParams.get(PROFILE_PARAM) === null) {
    return null
  }

  function close() {
    if (location.key === "default") {
      const params = new URLSearchParams(searchParams)
      params.delete(PROFILE_PARAM)
      setSearchParams(params, { replace: true })
      return
    }

    navigate(-1)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex h-[90svh] w-full flex-col gap-0 p-0 sm:max-w-2xl max-sm:h-svh max-sm:max-w-full">
        <header className="flex flex-col gap-1 border-b p-4 pr-12 sm:p-6 sm:pr-14">
          <DialogTitle>Meu perfil</DialogTitle>
          <DialogDescription>
            Suas informações.
          </DialogDescription>
        </header>

        {profile.isPending && (
          <div className={BODY_CLASS}>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {profile.isError && (
          <div className={BODY_CLASS}>
            <ErrorState
              error={normalizeApiError(profile.error)}
              onRetry={() => profile.refetch()}
              showBackToBoards={false}
            />
          </div>
        )}

        {profile.isSuccess && (
          <ProfileDialogBody profile={profile.data} onClose={close} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ProfileDialogBodyProps {
  profile: ProfileResponse
  onClose: () => void
}

function ProfileDialogBody({ profile, onClose }: ProfileDialogBodyProps) {
  const controller = useProfileForm(profile)

  return (
    <>
      <div className={BODY_CLASS}>
        <ProfileAvatarField profile={profile} />
        <ProfileForm id={FORM_ID} controller={controller} />
        <ProfileSocialLinks profile={profile} />
        <ProfileSecurity profile={profile} />
      </div>

      <DialogFooter className="border-t p-4 sm:p-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          disabled={!controller.form.formState.isDirty || controller.isPending}
        >
          {controller.isPending && <Spinner data-icon="inline-start" />}
          Salvar alterações
        </Button>
      </DialogFooter>
    </>
  )
}
