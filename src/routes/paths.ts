export const PATHS = {
  root: "/",
  login: "/login",
  register: "/register",
  boards: "/boards",
  board: (boardId: string | number) => `/boards/${boardId}`,
  teams: "/equipes",

  boardSettings: (boardId: string | number, tab: string = "geral") =>
    `/boards/${boardId}?settings=${tab}`,

  card: (boardId: string | number, cardId: string | number) =>
    `/boards/${boardId}/cards/${cardId}`,

  invite: (token?: string) => (token ? `/convite/${token}` : "/convite"),
} as const

export const ROUTE_PATTERNS = {
  board: "/boards/:boardId",
  card: "cards/:cardId",
  invite: "/convite/:token?",
} as const
