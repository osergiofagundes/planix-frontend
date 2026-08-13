import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCreateInvite } from "@/hooks/use-invites"
import { formatLongDate } from "@/lib/date"
import { queryKeys } from "@/lib/query-client"
import { PATHS } from "@/routes/paths"
import type { InviteCreatedResponse } from "@/types/invite.types"
import { TEAM_ROLE_LABELS } from "@/types/team.types"

const EXPIRY_OPTIONS = ["1", "7", "14", "30"] as const
const USES_OPTIONS = ["1", "5", "10", "25", "50"] as const
const ROLE_OPTIONS = ["MEMBER", "ADMIN"] as const

const DEFAULT_EXPIRY = "7"
const DEFAULT_USES = "1"
const DEFAULT_ROLE = "MEMBER"

type InvitableRole = (typeof ROLE_OPTIONS)[number]

interface TeamInviteDialogProps {
  teamId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamInviteDialog({
  teamId,
  open,
  onOpenChange,
}: TeamInviteDialogProps) {
  const queryClient = useQueryClient()
  const createInvite = useCreateInvite(teamId)

  const [expiresInDays, setExpiresInDays] = useState<string>(DEFAULT_EXPIRY)
  const [maxUses, setMaxUses] = useState<string>(DEFAULT_USES)
  const [role, setRole] = useState<InvitableRole>(DEFAULT_ROLE)
  const [created, setCreated] = useState<InviteCreatedResponse | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCreated(null)
      setExpiresInDays(DEFAULT_EXPIRY)
      setMaxUses(DEFAULT_USES)
      setRole(DEFAULT_ROLE)
      createInvite.reset()
    }

    onOpenChange(next)
  }

  function submit() {
    createInvite.mutate(
      {
        expiresInDays: Number(expiresInDays),
        maxUses: Number(maxUses),
        role,
      },
      {
        onSuccess: (invite) => {
          setCreated(invite)
          queryClient.invalidateQueries({
            queryKey: queryKeys.teams.invites(teamId),
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {created ? (
          <InviteCreated
            invite={created}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Convidar para a equipe</DialogTitle>
              <DialogDescription>
                Quem abrir o link entra na equipe e passa a ver os quadros
                abertos a ela, até o convite expirar ou esgotar os usos.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Entra como</FieldLabel>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  value={[role]}
                  onValueChange={(values) =>
                    setRole((values[0] as InvitableRole) ?? role)
                  }
                >
                  {ROLE_OPTIONS.map((option) => (
                    <ToggleGroupItem key={option} value={option}>
                      {TEAM_ROLE_LABELS[option]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription>
                  {role === "ADMIN"
                    ? "Administra a equipe e manda em qualquer quadro dela."
                    : "Usa os quadros a que tem acesso."}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Validade</FieldLabel>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  value={[expiresInDays]}
                  onValueChange={(values) =>
                    setExpiresInDays(values[0] ?? expiresInDays)
                  }
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <ToggleGroupItem key={option} value={option}>
                      {option === "1" ? "1 dia" : `${option} dias`}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <Field>
                <FieldLabel>Número de usos</FieldLabel>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  value={[maxUses]}
                  onValueChange={(values) => setMaxUses(values[0] ?? maxUses)}
                >
                  {USES_OPTIONS.map((option) => (
                    <ToggleGroupItem key={option} value={option}>
                      {option === "1" ? "1 uso" : `${option} usos`}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose
                render={<Button type="button" variant="outline" />}
                disabled={createInvite.isPending}
              >
                Cancelar
              </DialogClose>
              <Button onClick={submit} disabled={createInvite.isPending}>
                {createInvite.isPending && <Spinner data-icon="inline-start" />}
                Gerar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface InviteCreatedProps {
  invite: InviteCreatedResponse
  onClose: () => void
}

function InviteCreated({ invite, onClose }: InviteCreatedProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  const link = `${window.location.origin}${PATHS.invite(invite.token)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
      const input = document.getElementById("invite-link")

      if (input instanceof HTMLInputElement) {
        input.focus()
        input.select()
      }
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Convite criado</DialogTitle>
        <DialogDescription>
          Copie o link agora e envie para quem vai entrar. Válido até{" "}
          {formatLongDate(invite.expiresAt)}, com até {invite.maxUses}{" "}
          {invite.maxUses === 1 ? "uso" : "usos"}.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="invite-link">Link do convite</FieldLabel>
          <InputGroup>
            <InputGroupInput id="invite-link" readOnly value={link} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={copy} aria-label="Copiar o link">
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copiado" : "Copiar"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Este link não será mostrado de novo.</AlertTitle>
          <AlertDescription>
            Copie o link e envie para quem vai entrar.
          </AlertDescription>
        </Alert>

        {copyFailed && (
          <FieldDescription>
            Não consegui copiar automaticamente — o texto ficou selecionado para
            você copiar à mão.
          </FieldDescription>
        )}
      </FieldGroup>

      <DialogFooter>
        <Button onClick={onClose}>Já copiei, fechar</Button>
      </DialogFooter>
    </>
  )
}
