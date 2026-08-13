import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toastApiError } from "@/lib/api-feedback"
import { queryKeys } from "@/lib/query-client"
import { attachmentService } from "@/services/attachment.service"
import type { AttachmentResponse } from "@/types/card.types"

export function useAttachments(cardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.attachments(cardId ?? ""),
    queryFn: () => attachmentService.listByCard(cardId!),
    enabled: Boolean(cardId),
  })
}

export function useUploadAttachment(cardId: string) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: (file: File) =>
      attachmentService.upload(cardId, file, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      }),
    onMutate: () => setProgress(0),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.attachments(cardId),
      })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível enviar o arquivo"),
    onSettled: () => setProgress(null),
  })

  return { ...mutation, progress }
}

export function useDeleteAttachment(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: number) =>
      attachmentService.remove(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cards.attachments(cardId),
      })
    },
    onError: (error) =>
      toastApiError(error, "Não foi possível remover o anexo"),
  })
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (attachment: AttachmentResponse) =>
      attachmentService.download(attachment.id, attachment.originalFilename),
    onError: (error) =>
      toastApiError(error, "Não foi possível baixar o arquivo"),
  })
}
