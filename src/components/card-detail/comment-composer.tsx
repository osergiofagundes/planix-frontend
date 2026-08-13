import { useEffect, useRef, useState } from "react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { UserSummary } from "@/types/user.types"

interface CommentComposerProps {
  author: UserSummary | null
  label: string
  placeholder: string
  submitLabel: string
  isPending: boolean
  /** Texto inicial — usado para já entrar com o "@Nome " da resposta. */
  initialText?: string
  autoFocus?: boolean
  onSubmit: (text: string) => void
  onCancel?: () => void
}

export function CommentComposer({
  author,
  label,
  placeholder,
  submitLabel,
  isPending,
  initialText = "",
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [text, setText] = useState(initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!autoFocus) {
      return
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  }, [autoFocus])

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || isPending) {
      return
    }

    onSubmit(trimmed)
  }

  return (
    <div className="flex gap-2">
      {author && <UserAvatar user={author} size="sm" showTooltip={false} />}

      <div className="flex flex-1 flex-col gap-2">
        <Textarea
          ref={textareaRef}
          rows={2}
          placeholder={placeholder}
          value={text}
          aria-label={label}
          onChange={(event) => setText(event.target.value)}
        />

        {(text.length > 0 || onCancel) && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={submit} disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {submitLabel}
            </Button>

            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
