/**
 * Rotas da Planix API (backend Spring Boot).
 *
 * Fonte única de URLs do backend — nenhum caminho literal deve existir fora daqui.
 * Espelha `JAVA_API/api.json` (OpenAPI 3). Ao mudar a API, atualize este arquivo.
 *
 * Não confundir com `src/routes/paths.ts`, que são as rotas do frontend.
 */

/** Identificadores da API são `int64` no backend; aceitamos string para uso em params de rota. */
export type Id = number | string

export const API_ENDPOINTS = {
  /** Autenticação — `/api/auth/*` */
  auth: {
    /** POST — cria a conta e já devolve o par de tokens */
    register: "/api/auth/register",
    /** POST — devolve o par de tokens */
    login: "/api/auth/login",
    /** POST — troca o refresh token por um par novo (o antigo é revogado) */
    refresh: "/api/auth/refresh",
    /** POST — revoga o refresh token deste dispositivo */
    logout: "/api/auth/logout",
    /** POST — revoga todos os refresh tokens da conta */
    logoutAll: "/api/auth/logout-all",
    /** GET — dados da conta autenticada */
    me: "/api/auth/me",
  },

  /** Quadros — `/api/boards/*` */
  boards: {
    /** GET (listar) · POST (criar) */
    root: "/api/boards",
    /** GET · PUT · DELETE */
    byId: (id: Id) => `/api/boards/${id}`,
    /** GET (listar) · POST (criar) */
    lists: (boardId: Id) => `/api/boards/${boardId}/lists`,
    /** GET (listar) · POST (criar) */
    labels: (boardId: Id) => `/api/boards/${boardId}/labels`,
    /** GET (listar) · POST (criar) */
    invites: (boardId: Id) => `/api/boards/${boardId}/invites`,
    /** GET — membros do quadro */
    members: (boardId: Id) => `/api/boards/${boardId}/members`,
    /** DELETE — remover um membro */
    member: (boardId: Id, userId: Id) =>
      `/api/boards/${boardId}/members/${userId}`,
    /** DELETE — sair do quadro */
    leave: (boardId: Id) => `/api/boards/${boardId}/members/me`,
    /** PATCH — transferir a propriedade do quadro */
    owner: (id: Id) => `/api/boards/${id}/owner`,
  },

  /** Listas (colunas) — `/api/lists/*` */
  lists: {
    /** GET · PUT · DELETE */
    byId: (id: Id) => `/api/lists/${id}`,
    /** PATCH — reordenar a lista dentro do quadro */
    move: (id: Id) => `/api/lists/${id}/move`,
    /** GET (listar) · POST (criar) */
    cards: (listId: Id) => `/api/lists/${listId}/cards`,
  },

  /** Cartões — `/api/cards/*` */
  cards: {
    /** GET · PUT · DELETE */
    byId: (id: Id) => `/api/cards/${id}`,
    /** PATCH — mover entre listas / reordenar */
    move: (id: Id) => `/api/cards/${id}/move`,
    /** PATCH — marcar/desmarcar como concluído */
    complete: (id: Id) => `/api/cards/${id}/complete`,
    /** GET — histórico de alterações */
    changes: (cardId: Id) => `/api/cards/${cardId}/changes`,
    /** GET (listar) · POST (criar) */
    links: (cardId: Id) => `/api/cards/${cardId}/links`,
    /** GET (listar) · POST (criar) */
    comments: (cardId: Id) => `/api/cards/${cardId}/comments`,
    /** GET (listar) · POST (criar) */
    checklist: (cardId: Id) => `/api/cards/${cardId}/checklist`,
    /** GET (listar) · POST (enviar) */
    attachments: (cardId: Id) => `/api/cards/${cardId}/attachments`,
    /** POST (vincular) · DELETE (desvincular) */
    label: (cardId: Id, labelId: Id) =>
      `/api/cards/${cardId}/labels/${labelId}`,
    /** POST (atribuir) · DELETE (desatribuir) */
    assignee: (cardId: Id, userId: Id) =>
      `/api/cards/${cardId}/assignees/${userId}`,
  },

  /** Itens de checklist — `/api/checklist-items/*` */
  checklistItems: {
    /** PUT · DELETE */
    byId: (id: Id) => `/api/checklist-items/${id}`,
    /** PATCH — marcar/desmarcar */
    toggle: (id: Id) => `/api/checklist-items/${id}/toggle`,
    /** PATCH — reordenar dentro do checklist */
    move: (id: Id) => `/api/checklist-items/${id}/move`,
  },

  /** Comentários — `/api/comments/*` */
  comments: {
    /** PUT · DELETE */
    byId: (id: Id) => `/api/comments/${id}`,
  },

  /** Etiquetas — `/api/labels/*` */
  labels: {
    /** PUT · DELETE */
    byId: (id: Id) => `/api/labels/${id}`,
  },

  /** Links de cartão — `/api/links/*` */
  links: {
    /** PUT · DELETE */
    byId: (id: Id) => `/api/links/${id}`,
  },

  /** Anexos — `/api/attachments/*` */
  attachments: {
    /** DELETE */
    byId: (id: Id) => `/api/attachments/${id}`,
    /** GET — baixa o arquivo */
    download: (id: Id) => `/api/attachments/${id}/download`,
  },

  /** Convites — `/api/invites/*` */
  invites: {
    /** POST — consulta o convite a partir do token, sem aceitar */
    preview: "/api/invites/preview",
    /** POST — aceita o convite */
    accept: "/api/invites/accept",
    /** DELETE — revoga o convite */
    byId: (id: Id) => `/api/invites/${id}`,
  },
} as const

/**
 * Endpoints que não levam `Authorization` e cujo 401 é uma resposta de negócio
 * (credencial inválida / refresh expirado), não um sinal para renovar o token.
 */
export const PUBLIC_ENDPOINTS: readonly string[] = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.refresh,
]

export function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) {
    return false
  }

  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}
