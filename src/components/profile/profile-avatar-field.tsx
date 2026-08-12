import { useRef, useState } from "react"
import { ImageUpIcon, Trash2Icon } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  AvatarCropDialog,
  type PendingPhoto,
} from "@/components/profile/avatar-crop-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  useAvatarImage,
  useDeleteAvatar,
  useUploadAvatar,
} from "@/hooks/use-profile"
import { formatFileSize } from "@/lib/format"
import { getInitials } from "@/lib/initials"
import {
  ACCEPTED_AVATAR_TYPES,
  MAX_AVATAR_SOURCE_BYTES,
  type ProfileResponse,
} from "@/types/profile.types"

export function ProfileAvatarField({ profile }: { profile: ProfileResponse }) {
  const image = useAvatarImage(profile.avatarUrl)
  const upload = useUploadAvatar()
  const remove = useDeleteAvatar()

  const inputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingPhoto | null>(null)
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false)

  const isBusy = upload.isPending || remove.isPending

  function choose(file: File | undefined) {
    if (!file) {
      return
    }

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setFileError("A foto precisa ser JPEG, PNG ou WebP.")
      return
    }

    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      setFileError(
        `"${file.name}" tem ${formatFileSize(file.size)} — escolha uma imagem de até ${formatFileSize(MAX_AVATAR_SOURCE_BYTES)}.`
      )
      return
    }

    setFileError(null)
    setPending({ file, src: URL.createObjectURL(file) })
  }

  function clearPending() {
    if (pending) {
      URL.revokeObjectURL(pending.src)
    }

    setPending(null)
  }

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Avatar className="size-20">
        {image.data && <AvatarImage src={image.data} alt="" />}
        <AvatarFallback className="text-xl">
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ImageUpIcon data-icon="inline-start" />
            )}
            {profile.avatarUrl ? "Trocar foto" : "Enviar foto"}
          </Button>

          {profile.avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => setIsConfirmingRemoval(true)}
            >
              <Trash2Icon data-icon="inline-start" />
              Remover
            </Button>
          )}
        </div>

        {upload.progress !== null && (
          <Progress value={upload.progress}>
            <ProgressLabel>Enviando… {upload.progress}%</ProgressLabel>
          </Progress>
        )}

        {fileError && <p className="text-xs text-destructive">{fileError}</p>}

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPTED_AVATAR_TYPES.join(",")}
          aria-label="Selecionar foto de perfil"
          onChange={(event) => {
            choose(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </div>

      <AvatarCropDialog
        photo={pending}
        isUploading={upload.isPending}
        onCancel={clearPending}
        onConfirm={(cropped) =>
          upload.mutate(cropped, { onSuccess: clearPending })
        }
      />

      <ConfirmDialog
        open={isConfirmingRemoval}
        onOpenChange={setIsConfirmingRemoval}
        title="Remover a foto de perfil?"
        description="Você volta a aparecer com as iniciais do seu nome. Dá para enviar outra foto depois."
        confirmLabel="Remover foto"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => setIsConfirmingRemoval(false),
          })
        }
      />
    </section>
  )
}
