import type { AxiosProgressEvent } from "axios"

import { API_ENDPOINTS, type Id } from "@/api/endpoints"
import { api } from "@/api/http"
import type { AttachmentResponse } from "@/types/card.types"

export const attachmentService = {
  async listByCard(cardId: Id): Promise<AttachmentResponse[]> {
    const { data } = await api.get<AttachmentResponse[]>(
      API_ENDPOINTS.cards.attachments(cardId)
    )
    return data
  },

  async upload(
    cardId: Id,
    file: File,
    onUploadProgress?: (event: AxiosProgressEvent) => void
  ): Promise<AttachmentResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await api.post<AttachmentResponse>(
      API_ENDPOINTS.cards.attachments(cardId),
      formData,
      { headers: { "Content-Type": null }, onUploadProgress }
    )

    return data
  },

  async download(attachmentId: Id, filename: string): Promise<void> {
    const { data } = await api.get<Blob>(
      API_ENDPOINTS.attachments.download(attachmentId),
      { responseType: "blob" }
    )

    const objectUrl = URL.createObjectURL(data)

    try {
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = filename
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  },

  async remove(attachmentId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.attachments.byId(attachmentId))
  },
}
