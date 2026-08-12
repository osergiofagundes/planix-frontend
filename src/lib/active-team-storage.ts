const ACTIVE_TEAM_KEY = "planix.activeTeamId"

export const activeTeamStorage = {
  read(): number | null {
    try {
      const stored = Number(localStorage.getItem(ACTIVE_TEAM_KEY))
      return Number.isInteger(stored) && stored > 0 ? stored : null
    } catch {
      return null
    }
  },

  write(teamId: number): void {
    try {
      localStorage.setItem(ACTIVE_TEAM_KEY, String(teamId))
    } catch {
    }
  },
}
