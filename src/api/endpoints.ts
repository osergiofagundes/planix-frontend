export type Id = number | string

export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
    logoutAll: "/api/auth/logout-all",
    me: "/api/auth/me",
  },

  me: {
    profile: "/api/me/profile",
    email: "/api/me/email",
    password: "/api/me/password",
    avatar: "/api/me/avatar",
    socialLink: (platform: string) => `/api/me/social-links/${platform}`,
  },

  users: {
    avatar: (id: Id) => `/api/users/${id}/avatar`,
  },

  teams: {
    root: "/api/teams",
    byId: (id: Id) => `/api/teams/${id}`,
    owner: (id: Id) => `/api/teams/${id}/owner`,
    invites: (teamId: Id) => `/api/teams/${teamId}/invites`,
    members: (teamId: Id) => `/api/teams/${teamId}/members`,
    member: (teamId: Id, userId: Id) => `/api/teams/${teamId}/members/${userId}`,
    leave: (teamId: Id) => `/api/teams/${teamId}/members/me`,
  },

  boards: {
    root: "/api/boards",
    byId: (id: Id) => `/api/boards/${id}`,
    lists: (boardId: Id) => `/api/boards/${boardId}/lists`,
    labels: (boardId: Id) => `/api/boards/${boardId}/labels`,
    members: (boardId: Id) => `/api/boards/${boardId}/members`,
    memberCandidates: (boardId: Id) =>
      `/api/boards/${boardId}/members/candidates`,
    member: (boardId: Id, userId: Id) =>
      `/api/boards/${boardId}/members/${userId}`,
    leave: (boardId: Id) => `/api/boards/${boardId}/members/me`,
    owner: (id: Id) => `/api/boards/${id}/owner`,
  },

  lists: {
    byId: (id: Id) => `/api/lists/${id}`,
    move: (id: Id) => `/api/lists/${id}/move`,
    cards: (listId: Id) => `/api/lists/${listId}/cards`,
  },

  cards: {
    byId: (id: Id) => `/api/cards/${id}`,
    move: (id: Id) => `/api/cards/${id}/move`,
    complete: (id: Id) => `/api/cards/${id}/complete`,
    changes: (cardId: Id) => `/api/cards/${cardId}/changes`,
    links: (cardId: Id) => `/api/cards/${cardId}/links`,
    comments: (cardId: Id) => `/api/cards/${cardId}/comments`,
    checklist: (cardId: Id) => `/api/cards/${cardId}/checklist`,
    attachments: (cardId: Id) => `/api/cards/${cardId}/attachments`,
    label: (cardId: Id, labelId: Id) =>
      `/api/cards/${cardId}/labels/${labelId}`,
    assignee: (cardId: Id, userId: Id) =>
      `/api/cards/${cardId}/assignees/${userId}`,
  },

  checklistItems: {
    byId: (id: Id) => `/api/checklist-items/${id}`,
    toggle: (id: Id) => `/api/checklist-items/${id}/toggle`,
    move: (id: Id) => `/api/checklist-items/${id}/move`,
  },

  comments: {
    byId: (id: Id) => `/api/comments/${id}`,
  },

  labels: {
    byId: (id: Id) => `/api/labels/${id}`,
  },

  links: {
    byId: (id: Id) => `/api/links/${id}`,
  },

  attachments: {
    byId: (id: Id) => `/api/attachments/${id}`,
    download: (id: Id) => `/api/attachments/${id}/download`,
  },

  invites: {
    preview: "/api/invites/preview",
    accept: "/api/invites/accept",
    byId: (id: Id) => `/api/invites/${id}`,
  },
} as const

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
