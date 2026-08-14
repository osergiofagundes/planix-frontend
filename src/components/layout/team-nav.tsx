import { Link, useSearchParams } from "react-router-dom"
import { LayoutGridIcon, SettingsIcon } from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { TEAM_SETTINGS_PARAM } from "@/components/team-settings/team-settings-dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useActiveTeam } from "@/hooks/use-active-team"
import { PATHS } from "@/routes/paths"
import { TEAM_ROLE_LABELS } from "@/types/team.types"

const FALLBACK_ICON = "building-2" as IconName

export function TeamNav() {
  const { activeTeam, isPending } = useActiveTeam()
  const { setOpenMobile } = useSidebar()
  const [searchParams, setSearchParams] = useSearchParams()

  function closeOnMobile() {
    setOpenMobile(false)
  }

  function openSettings() {
    const params = new URLSearchParams(searchParams)
    params.set(TEAM_SETTINGS_PARAM, "geral")

    closeOnMobile()
    setSearchParams(params)
  }

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex h-12 items-center gap-2 p-2 text-xs group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <DynamicIcon
            name={(activeTeam?.icon ?? FALLBACK_ICON) as IconName}
            aria-hidden
            className="size-4 shrink-0"
          />
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">
              {activeTeam?.name ?? "Nenhuma equipe"}
            </span>
            {activeTeam && (
              <span className="truncate text-muted-foreground">
                {TEAM_ROLE_LABELS[activeTeam.myRole]}
              </span>
            )}
          </div>
        </div>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Gerenciar equipes"
          render={<Link to={PATHS.teams} onClick={closeOnMobile} />}
        >
          <LayoutGridIcon />
          <span>Gerenciar equipes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {activeTeam && (
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Configurações da equipe"
            onClick={openSettings}
          >
            <SettingsIcon />
            <span>Configurações da equipe</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
}
