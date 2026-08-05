import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateCard } from "@/hooks/use-card"
import { cardTitleSchema } from "@/schemas/card.schema"
import type { CardResponse } from "@/types/card.types"

interface CardTitleFieldProps {
  card: CardResponse
}

export function CardTitleField({ card }: CardTitleFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [error, setError] = useState<string | null>(null)

  const updateCard = useUpdateCard(card)

  function startEditing() {
    setTitle(card.title)
    setError(null)
    setIsEditing(true)
  }

  function submit() {
    const parsed = cardTitleSchema.safeParse({ title })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Título inválido.")
      return
    }

    if (parsed.data.title === card.title) {
      setIsEditing(false)
      return
    }

    updateCard.mutate(
      { title: parsed.data.title },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="-mx-2 px-2 py-1 text-left font-heading text-lg font-medium hover:bg-accent"
      >
        {card.title}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        autoFocus
        value={title}
        aria-invalid={Boolean(error)}
        aria-label="Título do cartão"
        onChange={(event) => {
          setTitle(event.target.value)
          setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            submit()
          }

          if (event.key === "Escape") {
            setIsEditing(false)
          }
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit} disabled={updateCard.isPending}>
          {updateCard.isPending && <Spinner data-icon="inline-start" />}
          Salvar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
