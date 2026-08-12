import { useCallback, useMemo, useState } from "react"

import { TeamContext, type TeamContextValue } from "@/contexts/team-context"
import { useTeams } from "@/hooks/use-teams"
import { activeTeamStorage } from "@/lib/active-team-storage"

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const teams = useTeams()
  const [chosenId, setChosenId] = useState(activeTeamStorage.read)

  const setActiveTeam = useCallback((teamId: number) => {
    activeTeamStorage.write(teamId)
    setChosenId(teamId)
  }, [])

  const value = useMemo<TeamContextValue>(() => {
    const list = teams.data ?? []

    const activeTeam =
      list.find((team) => team.id === chosenId) ?? list[0] ?? null

    return {
      teams: list,
      activeTeam,
      setActiveTeam,
      isPending: teams.isPending,
      isError: teams.isError,
    }
  }, [teams.data, teams.isPending, teams.isError, chosenId, setActiveTeam])

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}
