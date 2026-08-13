import { createContext } from "react"

import type { TeamResponse } from "@/types/team.types"

export interface TeamContextValue {
  teams: TeamResponse[]
  activeTeam: TeamResponse | null
  setActiveTeam: (teamId: number) => void
  isPending: boolean
  isError: boolean
}

export const TeamContext = createContext<TeamContextValue | undefined>(
  undefined
)
