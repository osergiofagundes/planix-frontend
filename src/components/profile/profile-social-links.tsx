import { useState } from "react"
import { GlobeIcon, LinkIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { Button } from "@/components/ui/button"
import { FieldLegend, FieldSet } from "@/components/ui/field"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useDeleteSocialLink, useUpsertSocialLink } from "@/hooks/use-profile"
import { socialLinkSchema } from "@/schemas/profile.schema"
import {
  SOCIAL_PLATFORMS,
  type ProfileResponse,
  type SocialPlatform,
} from "@/types/profile.types"

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  LINKEDIN: "LinkedIn",
  X: "X",
  INSTAGRAM: "Instagram",
  GITHUB: "GitHub",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  WEBSITE: "Website",
}

const PLATFORM_ITEMS = SOCIAL_PLATFORMS.map((platform) => ({
  value: platform,
  label: PLATFORM_LABELS[platform],
}))

export function ProfileSocialLinks({ profile }: { profile: ProfileResponse }) {
  const upsertLink = useUpsertSocialLink()
  const deleteLink = useDeleteSocialLink()

  const [platform, setPlatform] = useState<SocialPlatform>("LINKEDIN")
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const links = profile.socialLinks ?? []
  const isSaved = links.some((link) => link.platform === platform)

  function edit(target: SocialPlatform, currentUrl: string) {
    setPlatform(target)
    setUrl(currentUrl)
    setError(null)
  }

  function submit() {
    const parsed = socialLinkSchema.safeParse({ url })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Endereço inválido.")
      return
    }

    upsertLink.mutate(
      { platform, url: parsed.data.url },
      {
        onSuccess: () => {
          setUrl("")
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
    <FieldSet>
      <FieldLegend>Redes sociais</FieldLegend>

      <div className="flex flex-col gap-3">
        {links.length > 0 ? (
          <ItemGroup>
            {links.map((link) => (
              <Item key={link.platform} variant="outline" size="sm">
                <ItemMedia variant="icon">
                  {link.platform === "WEBSITE" ? <GlobeIcon /> : <LinkIcon />}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{PLATFORM_LABELS[link.platform]}</ItemTitle>
                  <ItemDescription className="truncate">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link.url}
                    </a>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Editar o endereço do ${PLATFORM_LABELS[link.platform]}`}
                    onClick={() => edit(link.platform, link.url)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover o ${PLATFORM_LABELS[link.platform]}`}
                    disabled={deleteLink.isPending}
                    onClick={() => deleteLink.mutate(link.platform)}
                  >
                    <Trash2Icon />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <p className="text-xs text-muted-foreground">
            Você ainda não cadastrou nenhuma rede.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            items={PLATFORM_ITEMS}
            value={platform}
            onValueChange={(value) => {
              setPlatform(value as SocialPlatform)
              setError(null)
            }}
          >
            <SelectTrigger className="sm:w-44" aria-label="Rede social">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PLATFORM_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            className="flex-1"
            placeholder="https://…"
            value={url}
            aria-label={`Endereço do perfil no ${PLATFORM_LABELS[platform]}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setUrl(event.target.value)
              setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                submit()
              }
            }}
          />

          <Button
            type="button"
            variant="outline"
            onClick={submit}
            disabled={upsertLink.isPending}
          >
            {upsertLink.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            {isSaved ? "Substituir" : "Adicionar"}
          </Button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

      </div>
    </FieldSet>
  )
}
