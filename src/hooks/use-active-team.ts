import { useContext } from "react"

import { TeamContext, type TeamContextValue } from "@/contexts/team-context"

export function useActiveTeam(): TeamContextValue {
  const context = useContext(TeamContext)

  if (context === undefined) {
    throw new Error("useActiveTeam precisa ser usado dentro de <TeamProvider>.")
  }

  return context
}
