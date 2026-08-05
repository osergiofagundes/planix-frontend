import { useRef, useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCard } from "@/hooks/use-cards"

interface CardComposerProps {
  listId: number
}

export function CardComposer({ listId }: CardComposerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const createCard = useCreateCard()

  function submit() {
    const trimmed = title.trim()

    if (!trimmed || createCard.isPending) {
      return
    }

    createCard.mutate(
      { listId, title: trimmed },
      {
        onSuccess: () => {
          setTitle("")
          textareaRef.current?.focus()
        },
      }
    )
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Adicionar cartão
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={textareaRef}
        autoFocus
        rows={2}
        placeholder="Título do cartão *"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            submit()
          }

          if (event.key === "Escape") {
            setIsOpen(false)
            setTitle("")
          }
        }}
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit} disabled={createCard.isPending}>
          {createCard.isPending && <Spinner data-icon="inline-start" />}
          Adicionar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
