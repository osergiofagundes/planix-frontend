import { useRef, useState } from "react"
import {
  DownloadIcon,
  PaperclipIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAttachments,
  useDeleteAttachment,
  useDownloadAttachment,
  useUploadAttachment,
} from "@/hooks/use-attachments"
import { formatDateTime } from "@/lib/date"
import { formatFileSize, getFileExtension } from "@/lib/format"
import { cn } from "@/lib/utils"
import { MAX_ATTACHMENT_BYTES } from "@/types/card.types"

interface CardAttachmentsProps {
  cardId: string
}

export function CardAttachments({ cardId }: CardAttachmentsProps) {
  const attachments = useAttachments(cardId)
  const upload = useUploadAttachment(cardId)
  const remove = useDeleteAttachment(cardId)
  const download = useDownloadAttachment()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isDropping, setIsDropping] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  function send(file: File | undefined) {
    if (!file) {
      return
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setSizeError(
        `"${file.name}" tem ${formatFileSize(file.size)} — o limite é ${formatFileSize(MAX_ATTACHMENT_BYTES)} por arquivo.`
      )
      return
    }

    setSizeError(null)
    upload.mutate(file)
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">
        Anexos{attachments.data ? ` · ${attachments.data.length}` : ""}
      </h3>

      {attachments.isPending && <Skeleton className="h-12 w-full" />}

      {attachments.isSuccess && attachments.data.length > 0 && (
        <ItemGroup>
          {attachments.data.map((attachment) => (
            <Item key={attachment.id} variant="outline" size="sm">
              <ItemMedia variant="icon">
                <PaperclipIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="truncate">
                  {attachment.originalFilename}
                </ItemTitle>
                <ItemDescription>
                  {getFileExtension(attachment.originalFilename)} ·{" "}
                  {formatFileSize(attachment.sizeBytes)} · enviado por{" "}
                  {attachment.author.name} em{" "}
                  {formatDateTime(attachment.createdAt)}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Baixar ${attachment.originalFilename}`}
                  disabled={download.isPending}
                  onClick={() => download.mutate(attachment)}
                >
                  <DownloadIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${attachment.originalFilename}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(attachment.id)}
                >
                  <Trash2Icon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}

      {upload.progress !== null && (
        <Progress value={upload.progress}>
          <ProgressLabel>Enviando… {upload.progress}%</ProgressLabel>
        </Progress>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDropping(true)
        }}
        onDragLeave={() => setIsDropping(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDropping(false)
          send(event.dataTransfer.files[0])
        }}
        className={cn(
          "flex flex-col items-center gap-2 border border-dashed p-4 text-center transition-colors",
          isDropping && "border-primary bg-accent"
        )}
      >
        <UploadIcon className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Arraste um arquivo aqui ou{" "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            selecione do computador
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Até {formatFileSize(MAX_ATTACHMENT_BYTES)} por arquivo.
        </p>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          aria-label="Selecionar arquivo para anexar"
          onChange={(event) => {
            send(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </div>

      {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
    </section>
  )
}
