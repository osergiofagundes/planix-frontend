import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateCard } from "@/hooks/use-card"
import { cardDescriptionSchema } from "@/schemas/card.schema"
import type { CardResponse } from "@/types/card.types"

interface CardDescriptionFieldProps {
  card: CardResponse
}

export function CardDescriptionField({ card }: CardDescriptionFieldProps) {
  const remote = card.description ?? ""

  const [baseline, setBaseline] = useState(remote)
  const [description, setDescription] = useState(remote)
  const [error, setError] = useState<string | null>(null)

  const updateCard = useUpdateCard(card)
  const isDirty = description !== baseline

  if (remote !== baseline && !isDirty) {
    setBaseline(remote)
    setDescription(remote)
  }

  function submit() {
    const parsed = cardDescriptionSchema.safeParse({ description })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Descrição inválida.")
      return
    }

    updateCard.mutate(
      { description: parsed.data.description || null },
      {
        onSuccess: (updated) => {
          setBaseline(updated.description ?? "")
          setDescription(updated.description ?? "")
        },
      }
    )
  }

  function cancel() {
    setDescription(baseline)
    setError(null)
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">Descrição</h3>

      <Textarea
        rows={6}
        placeholder="Adicionar uma descrição mais detalhada…"
        value={description}
        aria-invalid={Boolean(error)}
        aria-label="Descrição do cartão"
        onChange={(event) => {
          setDescription(event.target.value)
          setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isDirty) {
            cancel()
          }
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      {isDirty && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={submit} disabled={updateCard.isPending}>
            {updateCard.isPending && <Spinner data-icon="inline-start" />}
            Salvar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancel}
            disabled={updateCard.isPending}
          >
            Cancelar
          </Button>
        </div>
      )}
    </section>
  )
}
