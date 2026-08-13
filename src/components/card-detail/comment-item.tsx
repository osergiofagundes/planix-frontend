import { useState } from "react"

import { CommentComposer } from "@/components/card-detail/comment-composer"
import { CommentReactions } from "@/components/card-detail/comment-reactions"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateComment,
  useDeleteComment,
  useToggleCommentReaction,
  useUpdateComment,
} from "@/hooks/use-comments"
import { formatRelativeTime } from "@/lib/date"
import type { CommentResponse } from "@/types/card.types"
import type { UserSummary } from "@/types/user.types"

/** Quem está sendo respondido: o id vai para a API, a menção para o textarea. */
interface ReplyTarget {
  id: number
  mention: string
}

interface CommentItemProps {
  cardId: string
  comment: CommentResponse
  currentUser: UserSummary | null
  /**
   * Presente só nas respostas. É por aqui que uma resposta pede à raiz da
   * thread para abrir o campo — o segundo nível não tem campo próprio, e é
   * isso que mantém a árvore plana.
   */
  onReply?: (target: ReplyTarget) => void
}

export function CommentItem({
  cardId,
  comment,
  currentUser,
  onReply,
}: CommentItemProps) {
  const isRoot = onReply === undefined

  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

  const createComment = useCreateComment(cardId)

  function startReply(target: ReplyTarget) {
    if (onReply) {
      onReply(target)
      return
    }
    setReplyTarget(target)
  }

  return (
    <li className="flex flex-col gap-4">
      <CommentBody
        cardId={cardId}
        comment={comment}
        currentUser={currentUser}
        onReply={startReply}
      />

      {comment.replies.length > 0 && (
        <ul className="ml-4 flex flex-col gap-4 border-l border-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              cardId={cardId}
              comment={reply}
              currentUser={currentUser}
              onReply={startReply}
            />
          ))}
        </ul>
      )}

      {isRoot && replyTarget && (
        <div className="ml-4 pl-4">
          <CommentComposer
            key={replyTarget.id}
            author={currentUser}
            label="Resposta"
            placeholder="Escreva uma resposta…"
            submitLabel="Responder"
            isPending={createComment.isPending}
            initialText={replyTarget.mention}
            autoFocus
            onSubmit={(text) =>
              createComment.mutate(
                { text, parentId: replyTarget.id },
                { onSuccess: () => setReplyTarget(null) }
              )
            }
            onCancel={() => setReplyTarget(null)}
          />
        </div>
      )}
    </li>
  )
}

interface CommentBodyProps {
  cardId: string
  comment: CommentResponse
  currentUser: UserSummary | null
  onReply: (target: ReplyTarget) => void
}

function CommentBody({
  cardId,
  comment,
  currentUser,
  onReply,
}: CommentBodyProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(comment.text ?? "")

  const updateComment = useUpdateComment(cardId)
  const deleteComment = useDeleteComment(cardId)
  const toggleReaction = useToggleCommentReaction(cardId)

  const canAct = !comment.deleted
  const isOwn = canAct && comment.author.id === currentUser?.id

  function submit() {
    const trimmed = text.trim()

    if (!trimmed || trimmed === comment.text) {
      setText(comment.text ?? "")
      setIsEditing(false)
      return
    }

    updateComment.mutate(
      { commentId: comment.id, text: trimmed },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  return (
    <div className="flex gap-2">
      <UserAvatar user={comment.author} size="sm" showTooltip={false} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {comment.edited && (
            <span className="text-xs text-muted-foreground">[Editado]</span>
          )}
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
                {updateComment.isPending && (
                  <Spinner data-icon="inline-start" />
                )}
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setText(comment.text ?? "")
                  setIsEditing(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {comment.deleted ? (
              <p className="text-xs/relaxed text-muted-foreground italic">
                [comentário excluído]
              </p>
            ) : (
              <p className="text-xs/relaxed whitespace-pre-wrap">
                {comment.text}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1">
              <CommentReactions
                reactions={comment.reactions}
                onToggle={(emoji) =>
                  toggleReaction.mutate({ commentId: comment.id, emoji })
                }
              />

              {canAct && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    onReply({
                      id: comment.id,
                      mention:
                        comment.parentId === null
                          ? ""
                          : `@${comment.author.name} `,
                    })
                  }
                >
                  Responder
                </Button>
              )}

              {isOwn && (
                <>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    disabled={deleteComment.isPending}
                    onClick={() => deleteComment.mutate(comment.id)}
                  >
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
