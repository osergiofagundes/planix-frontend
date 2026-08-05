import { useState } from "react"
import { ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  useCardLinks,
  useCreateCardLink,
  useDeleteCardLink,
} from "@/hooks/use-card-links"
import { getUrlHost } from "@/lib/format"
import { cardLinkSchema } from "@/schemas/card.schema"

interface CardLinksProps {
  cardId: string
}

export function CardLinks({ cardId }: CardLinksProps) {
  const links = useCardLinks(cardId)
  const deleteLink = useDeleteCardLink(cardId)

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">
        Links{links.data ? ` · ${links.data.length}` : ""}
      </h3>

      {links.isPending && <Skeleton className="h-12 w-full" />}

      {links.isSuccess && links.data.length > 0 && (
        <ItemGroup>
          {links.data.map((link) => (
            <Item key={link.id} variant="outline" size="sm">
              <ItemMedia variant="icon">
                <ExternalLinkIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="truncate">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.title || getUrlHost(link.url)}
                  </a>
                </ItemTitle>
                <ItemDescription className="truncate">
                  {link.url}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover o link ${link.title || link.url}`}
                  disabled={deleteLink.isPending}
                  onClick={() => deleteLink.mutate(link.id)}
                >
                  <Trash2Icon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}

      <NewLinkForm cardId={cardId} />
    </section>
  )
}

function NewLinkForm({ cardId }: { cardId: string }) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)

  const createLink = useCreateCardLink(cardId)

  function submit() {
    const parsed = cardLinkSchema.safeParse({ url, title })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Link inválido.")
      return
    }

    createLink.mutate(
      { url: parsed.data.url, title: parsed.data.title || null },
      {
        onSuccess: () => {
          setUrl("")
          setTitle("")
          setError(null)
        },
        onError: (mutationError) => {
          const normalized = normalizeApiError(mutationError)
          setError(normalized.fieldErrors.url ?? normalized.message)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="h-8 flex-1"
          placeholder="https://… *"
          value={url}
          aria-label="Endereço do link"
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setUrl(event.target.value)
            setError(null)
          }}
        />
        <Input
          className="h-8 flex-1"
          placeholder="Rótulo (opcional)"
          value={title}
          aria-label="Rótulo do link"
          onChange={(event) => setTitle(event.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={submit}
          disabled={createLink.isPending}
        >
          {createLink.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
          Adicionar
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
