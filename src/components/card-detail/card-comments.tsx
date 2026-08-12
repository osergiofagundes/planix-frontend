import { useState } from "react"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/hooks/use-comments"
import { useProfile } from "@/hooks/use-profile"
import { formatRelativeTime } from "@/lib/date"
import type { CommentResponse } from "@/types/card.types"

interface CardCommentsProps {
  cardId: string
}

export function CardComments({ cardId }: CardCommentsProps) {
  const { user } = useAuth()
  const profile = useProfile()
  const comments = useComments(cardId)

  const author = profile.data ?? user

  const [text, setText] = useState("")
  const createComment = useCreateComment(cardId)

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || createComment.isPending) {
      return
    }

    createComment.mutate(trimmed, { onSuccess: () => setText("") })
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">
        Comentários{comments.data ? ` · ${comments.data.length}` : ""}
      </h3>

      <div className="flex gap-2">
        {author && <UserAvatar user={author} size="sm" showTooltip={false} />}

        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            rows={2}
            placeholder="Escreva um comentário…"
            value={text}
            aria-label="Novo comentário"
            onChange={(event) => setText(event.target.value)}
          />
          {text.length > 0 && (
            <Button
              size="sm"
              className="self-start"
              onClick={submit}
              disabled={createComment.isPending}
            >
              {createComment.isPending && <Spinner data-icon="inline-start" />}
              Comentar
            </Button>
          )}
        </div>
      </div>

      {comments.isPending && <Skeleton className="h-16 w-full" />}

      {comments.isSuccess && comments.data.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum comentário ainda.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.data?.map((comment) => (
          <CommentRow
            key={comment.id}
            cardId={cardId}
            comment={comment}
            isOwn={comment.author.id === user?.id}
          />
        ))}
      </ul>
    </section>
  )
}

interface CommentRowProps {
  cardId: string
  comment: CommentResponse
  isOwn: boolean
}

function CommentRow({ cardId, comment, isOwn }: CommentRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(comment.text)

  const updateComment = useUpdateComment(cardId)
  const deleteComment = useDeleteComment(cardId)

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || trimmed === comment.text) {
      setText(comment.text)
      setIsEditing(false)
      return
    }

    updateComment.mutate(
      { commentId: comment.id, text: trimmed },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  return (
    <li className="flex gap-2">
      <UserAvatar user={comment.author} size="sm" showTooltip={false} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              autoFocus
              rows={3}
              value={text}
              aria-label="Editar comentário"
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={submit}
                disabled={updateComment.isPending}
              >
                {updateComment.isPending && <Spinner data-icon="inline-start" />}
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setText(comment.text)
                  setIsEditing(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs/relaxed whitespace-pre-wrap">{comment.text}</p>
        )}

        {isOwn && !isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deleteComment.isPending}
              onClick={() => deleteComment.mutate(comment.id)}
            >
              Excluir
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}
