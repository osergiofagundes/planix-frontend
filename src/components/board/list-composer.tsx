import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useCreateList } from "@/hooks/use-lists"

interface ListComposerProps {
  boardId: string
}

export function ListComposer({ boardId }: ListComposerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")

  const createList = useCreateList(boardId)

  function submit() {
    const trimmed = name.trim()

    if (!trimmed || createList.isPending) {
      return
    }

    createList.mutate(trimmed, {
      onSuccess: () => {
        setName("")
        setIsOpen(false)
      },
    })
  }

  function close() {
    setIsOpen(false)
    setName("")
  }

  return (
    <div className="w-72 shrink-0 max-sm:w-[80vw]">
      {isOpen ? (
        <div className="flex flex-col gap-2 border bg-muted/40 p-3">
          <Input
            autoFocus
            placeholder="Nome da lista *"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                submit()
              }

              if (event.key === "Escape") {
                close()
              }
            }}
          />

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={submit} disabled={createList.isPending}>
              {createList.isPending && <Spinner data-icon="inline-start" />}
              Adicionar
            </Button>
            <Button variant="ghost" size="sm" onClick={close}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon data-icon="inline-start" />
          Adicionar lista
        </Button>
      )}
    </div>
  )
}
