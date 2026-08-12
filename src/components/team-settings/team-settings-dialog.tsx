import { useSearchParams } from "react-router-dom"

import { TeamDangerTab } from "@/components/team-settings/team-danger-tab"
import { TeamGeneralTab } from "@/components/team-settings/team-general-tab"
import { TeamInvitesTab } from "@/components/team-settings/team-invites-tab"
import { TeamMembersTab } from "@/components/team-settings/team-members-tab"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveTeam } from "@/hooks/use-active-team"
import { isTeamAdmin } from "@/types/team.types"

export const TEAM_SETTINGS_PARAM = "teamSettings"

const SETTINGS_TABS = ["geral", "membros", "convites", "perigo"]

const ADMIN_ONLY_TABS = ["geral", "convites"]

export function TeamSettingsDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeTeam } = useActiveTeam()

  const requestedTab = searchParams.get(TEAM_SETTINGS_PARAM)

  if (requestedTab === null || !activeTeam) {
    return null
  }

  const isAdmin = isTeamAdmin(activeTeam.myRole)
  const isOwner = activeTeam.myRole === "OWNER"

  const tab = SETTINGS_TABS.includes(requestedTab) ? requestedTab : "geral"

  const blocked =
    (!isAdmin && ADMIN_ONLY_TABS.includes(tab)) || (!isOwner && tab === "perigo")
  const activeTab = blocked ? "membros" : tab

  function changeTab(next: string) {
    const params = new URLSearchParams(searchParams)
    params.set(TEAM_SETTINGS_PARAM, next)

    setSearchParams(params, { replace: true })
  }

  function close() {
    const params = new URLSearchParams(searchParams)
    params.delete(TEAM_SETTINGS_PARAM)

    setSearchParams(params, { replace: true })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex h-[90svh] w-full flex-col gap-0 p-0 sm:max-w-3xl max-sm:h-svh max-sm:max-w-full">
        <header className="flex flex-col gap-1 border-b p-4 pr-12 sm:p-6 sm:pr-14">
          <DialogTitle>Configurações da equipe</DialogTitle>
          <DialogDescription className="truncate">
            {activeTeam.name}
          </DialogDescription>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) => changeTab(String(value))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mx-4 mt-4 w-fit max-w-full sm:mx-6">
            {isAdmin && <TabsTrigger value="geral">Geral</TabsTrigger>}
            <TabsTrigger value="membros">Membros</TabsTrigger>
            {isAdmin && <TabsTrigger value="convites">Convites</TabsTrigger>}
            {isOwner && <TabsTrigger value="perigo">Zona de perigo</TabsTrigger>}
          </TabsList>

          {isAdmin && (
            <TabsContent
              value="geral"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <TeamGeneralTab team={activeTeam} />
            </TabsContent>
          )}

          <TabsContent
            value="membros"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <TeamMembersTab team={activeTeam} />
          </TabsContent>

          {isAdmin && (
            <TabsContent
              value="convites"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <TeamInvitesTab
                teamId={activeTeam.id}
                enabled={activeTab === "convites"}
              />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent
              value="perigo"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <TeamDangerTab team={activeTeam} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
