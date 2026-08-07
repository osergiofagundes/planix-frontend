import { useState } from "react"
import { LockIcon, MailIcon } from "lucide-react"

import { EmailChangeForm } from "@/components/profile/email-change-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { Button } from "@/components/ui/button"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { ProfileResponse } from "@/types/profile.types"

type OpenForm = "email" | "password" | null

export function ProfileSecurity({ profile }: { profile: ProfileResponse }) {
  const [open, setOpen] = useState<OpenForm>(null)

  function close() {
    setOpen(null)
  }

  function toggle(form: Exclude<OpenForm, null>) {
    setOpen((current) => (current === form ? null : form))
  }

  return (
    <FieldSet>
      <FieldLegend>Segurança</FieldLegend>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <Item variant="outline" size="sm">
            <ItemMedia variant="icon">
              <MailIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>E-mail</ItemTitle>
              <ItemDescription className="truncate">
                {profile.email}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={open === "email"}
                onClick={() => toggle("email")}
              >
                {open === "email" ? "Cancelar" : "Trocar"}
              </Button>
            </ItemActions>
          </Item>

          {open === "email" && (
            <div className="border border-t-0 p-3">
              <EmailChangeForm onDone={close} />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Item variant="outline" size="sm">
            <ItemMedia variant="icon">
              <LockIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Senha</ItemTitle>
              <ItemDescription>••••••••</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={open === "password"}
                onClick={() => toggle("password")}
              >
                {open === "password" ? "Cancelar" : "Trocar senha"}
              </Button>
            </ItemActions>
          </Item>

          {open === "password" && (
            <div className="border border-t-0 p-3">
              <PasswordChangeForm onDone={close} />
            </div>
          )}
        </div>
      </div>
    </FieldSet>
  )
}
