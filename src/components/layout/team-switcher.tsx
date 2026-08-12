import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  LayoutGridIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { TeamFormDialog } from "@/components/team/team-form-dialog"
import { TEAM_SETTINGS_PARAM } from "@/components/team-settings/team-settings-dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useActiveTeam } from "@/hooks/use-active-team"
import { cn } from "@/lib/utils"
import { PATHS } from "@/routes/paths"
import { TEAM_ROLE_LABELS, type TeamResponse } from "@/types/team.types"

const FALLBACK_ICON = "building-2" as IconName

/** Abaixo disso a lista cabe na tela e o campo de busca só atrapalharia. */
const SEARCH_THRESHOLD = 6

export function TeamSwitcher() {
  const { teams, activeTeam, setActiveTeam, isPending } = useActiveTeam()
  const { isMobile, setOpenMobile } = useSidebar()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const showSearch = teams.length >= SEARCH_THRESHOLD
  const matches = teams.filter((team) => matchesSearch(team, search))

  function close() {
    setIsOpen(false)
    setSearch("")
  }

  function choose(team: TeamResponse) {
    setActiveTeam(team.id)
    setOpenMobile(false)
    close()
  }

  function openSettings() {
    const params = new URLSearchParams(searchParams)
    params.set(TEAM_SETTINGS_PARAM, "geral")

    setOpenMobile(false)
    close()
    setSearchParams(params)
  }

  function goToTeams() {
    setOpenMobile(false)
    close()
    navigate(PATHS.teams)
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
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover
            open={isOpen}
            onOpenChange={(open) => (open ? setIsOpen(true) : close())}
          >
            <PopoverTrigger
              render={
                <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
              }
              aria-label="Trocar de equipe"
            >
              <DynamicIcon
                name={(activeTeam?.icon ?? FALLBACK_ICON) as IconName}
                aria-hidden
                className="size-4 shrink-0"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">
                  {activeTeam?.name ?? "Nenhuma equipe"}
                </span>
                <span className="truncate text-muted-foreground">
                  {activeTeam
                    ? TEAM_ROLE_LABELS[activeTeam.myRole]
                    : "Crie a primeira"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </PopoverTrigger>

            <PopoverContent
              className="w-64 gap-0 p-0"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={8}
            >
              {showSearch && (
                <div className="border-b p-2">
                  <Input
                    autoFocus
                    placeholder="Buscar equipe…"
                    aria-label="Buscar equipe"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              )}

              <div className="flex max-h-72 flex-col overflow-y-auto overscroll-contain p-1">
                {matches.length === 0 ? (
                  <p className="px-2 py-3 text-center text-muted-foreground">
                    {teams.length === 0
                      ? "Você ainda não tem equipes."
                      : "Nenhuma equipe com esse nome."}
                  </p>
                ) : (
                  matches.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => choose(team)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent hover:cursor-pointer",
                        team.id === activeTeam?.id && "bg-muted"
                      )}
                    >
                      <DynamicIcon
                        name={(team.icon ?? FALLBACK_ICON) as IconName}
                        aria-hidden
                        className="size-4 shrink-0"
                      />
                      <span className="truncate">{team.name}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground">
                        {TEAM_ROLE_LABELS[team.myRole]}
                      </span>
                      {team.id === activeTeam?.id && (
                        <CheckIcon className="size-4 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-col border-t p-1">
                {activeTeam && (
                  <button
                    type="button"
                    onClick={openSettings}
                    className="flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent hover:cursor-pointer"
                  >
                    <SettingsIcon className="size-4 shrink-0" />
                    Configurações da equipe
                  </button>
                )}

                <button
                  type="button"
                  onClick={goToTeams}
                  className="flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent hover:cursor-pointer"
                >
                  <LayoutGridIcon className="size-4 shrink-0" />
                  Gerenciar equipes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    close()
                    setIsCreating(true)
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent hover:cursor-pointer"
                >
                  <PlusIcon className="size-4 shrink-0" />
                  Nova equipe
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>

      <TeamFormDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onCreated={(team) => setActiveTeam(team.id)}
      />
    </>
  )
}

function matchesSearch(team: TeamResponse, search: string): boolean {
  const term = normalize(search)
  return term === "" || normalize(team.name).includes(term)
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}
