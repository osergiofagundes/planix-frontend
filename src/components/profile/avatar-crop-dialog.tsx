import { useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import { ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { formatFileSize } from "@/lib/format"
import { cropImageToFile } from "@/lib/image"
import { MAX_AVATAR_BYTES } from "@/types/profile.types"

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

const CENTER: Point = { x: 0, y: 0 }

export interface PendingPhoto {
  file: File
  src: string
}

interface AvatarCropDialogProps {
  photo: PendingPhoto | null
  isUploading: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function AvatarCropDialog({
  photo,
  isUploading,
  onCancel,
  onConfirm,
}: AvatarCropDialogProps) {
  return (
    <Dialog
      open={photo !== null}
      onOpenChange={(open) => {
        if (!open && !isUploading) {
          onCancel()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recortar foto</DialogTitle>
          <DialogDescription>
            Arraste para posicionar e use o zoom. O que estiver dentro do
            círculo vira a sua foto de perfil.
          </DialogDescription>
        </DialogHeader>

        {photo && (
          <AvatarCropper
            key={photo.src}
            src={photo.src}
            filename={photo.file.name}
            isUploading={isUploading}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface AvatarCropperProps {
  src: string
  filename: string
  isUploading: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
}

function AvatarCropper({
  src,
  filename,
  isUploading,
  onCancel,
  onConfirm,
}: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>(CENTER)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [area, setArea] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const isBusy = isCropping || isUploading

  function changeZoom(delta: number) {
    setZoom((current) =>
      Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))
      )
    )
  }

  async function confirm() {
    if (!area) {
      return
    }

    setIsCropping(true)

    try {
      const cropped = await cropImageToFile(src, area, filename)

      if (cropped.size > MAX_AVATAR_BYTES) {
        setError(
          `O recorte ficou com ${formatFileSize(cropped.size)} — o limite é ${formatFileSize(MAX_AVATAR_BYTES)}. Tente uma área menor.`
        )
        return
      }

      onConfirm(cropped)
    } catch {
      setError("Não foi possível recortar a imagem. Tente outra foto.")
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <>
      <div className="relative h-64 w-full bg-muted sm:h-72">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_croppedArea, croppedAreaPixels) =>
            setArea(croppedAreaPixels)
          }
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Diminuir o zoom"
          disabled={isBusy || zoom <= MIN_ZOOM}
          onClick={() => changeZoom(-ZOOM_STEP)}
        >
          <ZoomOutIcon />
        </Button>

        <span className="w-12 text-center text-xs text-muted-foreground tabular-nums">
          {zoom.toFixed(1)}×
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Aumentar o zoom"
          disabled={isBusy || zoom >= MAX_ZOOM}
          onClick={() => changeZoom(ZOOM_STEP)}
        >
          <ZoomInIcon />
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="button" disabled={isBusy || !area} onClick={confirm}>
          {isBusy && <Spinner data-icon="inline-start" />}
          Salvar foto
        </Button>
      </DialogFooter>
    </>
  )
}
