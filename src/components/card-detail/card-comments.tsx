import { useState } from "react"

import { CommentComposer } from "@/components/card-detail/comment-composer"
import { CommentItem } from "@/components/card-detail/comment-item"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useComments, useCreateComment } from "@/hooks/use-comments"
import { useProfile } from "@/hooks/use-profile"
import type { CommentResponse } from "@/types/card.types"

interface CardCommentsProps {
  cardId: string
}

export function CardComments({ cardId }: CardCommentsProps) {
  const { user } = useAuth()
  const profile = useProfile()
  const comments = useComments(cardId)

  const author = profile.data ?? user ?? null

  const createComment = useCreateComment(cardId)

  const [composerRun, setComposerRun] = useState(0)

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">
        Comentários{comments.data ? ` · ${countAll(comments.data)}` : ""}
      </h3>

      <CommentComposer
        key={composerRun}
        author={author}
        label="Novo comentário"
        placeholder="Escreva um comentário…"
        submitLabel="Comentar"
        isPending={createComment.isPending}
        onSubmit={(text) =>
          createComment.mutate(
            { text },
            { onSuccess: () => setComposerRun((run) => run + 1) }
          )
        }
      />

      {comments.isPending && <Skeleton className="h-16 w-full" />}

      {comments.isSuccess && comments.data.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum comentário ainda.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.data?.map((comment) => (
          <CommentItem
            key={comment.id}
            cardId={cardId}
            comment={comment}
            currentUser={user ?? null}
          />
        ))}
      </ul>
    </section>
  )
}

/**
 * Conta as linhas que estão na tela: as respostas entram, e as lápides também —
 * comentário excluído continua ocupando uma linha na lista.
 */
function countAll(comments: CommentResponse[]): number {
  return comments.reduce(
    (total, comment) => total + comment.replies.length + 1,
    0
  )
}
