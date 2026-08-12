# Implementando uma feature nova

A receita, camada por camada, **de baixo para cima**. Seguir essa ordem faz o
TypeScript trabalhar a seu favor: quando você chega na UI, tudo que ela precisa
já existe e já está tipado.

Cada passo mostra o código real de `board` como referência. Copie o formato.

---

## 1. Endpoint — `src/api/endpoints.ts`

Nenhuma URL literal fora deste arquivo. Rota com parâmetro vira função.

```ts
boards: {
  root: "/api/boards",
  byId: (id: Id) => `/api/boards/${id}`,
  members: (boardId: Id) => `/api/boards/${boardId}/members`,
  member: (boardId: Id, userId: Id) => `/api/boards/${boardId}/members/${userId}`,
},
```

Se o endpoint for acessível sem login, adicione-o também a `PUBLIC_ENDPOINTS` —
senão o interceptor tenta renovar o token num 401 que era esperado.

## 2. Contratos — `src/types/<domínio>.types.ts`

Espelhe os DTOs do backend. `…Response` para o que volta, `…Request` para o que
vai. Junto deles moram os rótulos em português e os guards do domínio.

```ts
export type BoardVisibility = "TEAM" | "RESTRICTED"

export const BOARD_VISIBILITY_LABELS: Record<BoardVisibility, string> = {
  TEAM: "Toda a equipe",
  RESTRICTED: "Somente convidados",
}

export interface BoardResponse {
  id: number
  teamId: number
  name: string
  description: string | null
  visibility: BoardVisibility
  owner: UserSummary
  createdAt: string
  updatedAt: string
}

export interface BoardRequest {
  name: string
  description?: string | null
  visibility: BoardVisibility
}
```

Data vem como `string` (ISO) do backend e continua `string` aqui — a conversão é
na hora de exibir, com os helpers de `lib/date.ts`. Campo que o backend pode
devolver nulo é `| null` no tipo, não opcional.

## 3. Service — `src/services/<domínio>.service.ts`

Um objeto, uma função por operação. Sem React, sem toast, sem cache: só
transporte. Ele desembrulha o `data` do axios e devolve o tipo do contrato.

```ts
export const boardService = {
  async list(teamId?: Id): Promise<BoardResponse[]> {
    const { data } = await api.get<BoardResponse[]>(API_ENDPOINTS.boards.root, {
      params: teamId ? { teamId } : undefined,
    })
    return data
  },

  async create(payload: BoardCreateRequest): Promise<BoardResponse> {
    const { data } = await api.post<BoardResponse>(
      API_ENDPOINTS.boards.root,
      payload
    )
    return data
  },

  async remove(boardId: Id): Promise<void> {
    await api.delete(API_ENDPOINTS.boards.byId(boardId))
  },
}
```

Não trate erro aqui. Deixe o erro subir — quem decide o que mostrar é o hook ou
o formulário.

## 4. Chave de cache — `queryKeys`, em `src/lib/query-client.ts`

Toda query registra sua chave aqui. Chave inventada no meio de um hook é o
caminho mais rápido para um cache que não invalida.

```ts
boards: {
  all: ["boards"] as const,
  byTeam: (teamId: Id) => ["boards", "team", String(teamId)] as const,
  detail: (boardId: Id) => ["boards", String(boardId)] as const,
  members: (boardId: Id) => ["boards", String(boardId), "members"] as const,
},
```

Duas regras que fazem a invalidação funcionar: **do geral para o específico**
(`["boards", id, "members"]`, nunca `["board-members", id]`), e **id sempre como
`String`** — `["boards", 1]` e `["boards", "1"]` são caches diferentes, e o
`boardId` chega da URL como string e do backend como número.

## 5. Hooks — `src/hooks/use-<domínio>.ts`

Aqui mora a decisão de quando buscar, o que invalidar e o que avisar. Um arquivo
por domínio, com as queries e as mutations juntas.

**Query:**

```ts
export function useBoard(boardId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId ?? ""),
    queryFn: () => boardService.getById(boardId!),
    enabled: Boolean(boardId),
  })
}
```

`enabled` protege o `!`: sem id, a query não roda.

**Mutation:**

```ts
export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BoardCreateRequest) => boardService.create(payload),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all })
      queryClient.setQueryData(queryKeys.boards.detail(board.id), board)
      toastSuccess("Quadro criado.", board.name)
    },
  })
}
```

**A regra do `onError`, que é fácil de errar:**

- Mutation disparada por **botão de ação** (excluir, sair, mover, adicionar
  membro) **leva** `onError: (error) => toastApiError(error, "Não foi possível …")`.
  Não há onde mostrar o erro senão num toast.
- Mutation disparada por **formulário** **não leva** `onError`. O formulário
  cuida disso: campo inválido vira erro no campo, o resto vira alerta dentro do
  dialog. Veja [FORMULARIOS.md](FORMULARIOS.md).

Compare `useCreateBoard` (formulário, sem `onError`) com `useDeleteBoard`
(ação, com `onError`) — ambos em `hooks/use-boards.ts`.

**`invalidateQueries` ou `setQueryData`?** Invalide a lista (ela pode ter mudado
de tamanho e de ordem); escreva direto no detalhe quando a resposta da mutation
já é o objeto atualizado. Fazer os dois, como acima, evita um piscar na tela.

## 6. Schema — `src/schemas/<domínio>.schema.ts`

Só se a feature tem formulário. Mensagens em português, terminadas em ponto.

```ts
export const boardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  visibility: z.enum(["TEAM", "RESTRICTED"]),
})

export type BoardFormValues = z.infer<typeof boardSchema>
```

Os limites precisam bater com os do backend, senão o usuário só descobre o erro
depois de enviar. O tipo do formulário sai do schema por `z.infer` — não escreva
a interface na mão.

## 7. Componente — `src/components/<domínio>/`

Consome hooks. Nunca importa service, axios ou endpoint.

Uma tela que carrega dado trata **três estados**, sempre:

```tsx
{boards.isPending && <BoardsSkeleton />}

{boards.isError && (
  <ErrorState error={normalizeApiError(boards.error)} onRetry={() => boards.refetch()} />
)}

{boards.isSuccess && boards.data.length === 0 && (
  <Empty>…</Empty>
)}
```

Esqueceu o estado vazio é o erro mais comum aqui — e é o que a pessoa vê no
primeiro acesso, quando ainda não criou nada.

Se o componente é genérico o bastante para dois domínios usarem, ele vai para
`components/common/`.

## 8. Página e rota

Página em `src/pages/<nome>-page.tsx`, e a rota em dois arquivos:

```ts
// routes/paths.ts — para navegar
board: (boardId: string | number) => `/boards/${boardId}`,

// routes/paths.ts — para declarar
export const ROUTE_PATTERNS = {
  board: "/boards/:boardId",
} as const
```

```tsx
// routes/app-routes.tsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path={ROUTE_PATTERNS.board} element={<BoardPage />} />
  </Route>
</Route>
```

Nunca escreva `"/boards/" + id` num `navigate` ou `<Link>`: use `PATHS`. Rota
que exige login fica dentro de `<ProtectedRoute />`; rota que só faz sentido
deslogado (login, cadastro) fica dentro de `<PublicRoute />`.

---

## Quais arquivos uma feature nova costuma tocar

Para um domínio novo chamado `widget`, com listagem e formulário:

```
src/api/endpoints.ts           (+ bloco widgets)
src/types/widget.types.ts      (novo)
src/services/widget.service.ts (novo)
src/lib/query-client.ts        (+ queryKeys.widgets)
src/hooks/use-widgets.ts       (novo)
src/schemas/widget.schema.ts   (novo)
src/components/widget/         (novo: lista, card, form-dialog, delete-dialog)
src/pages/widgets-page.tsx     (novo)
src/routes/paths.ts            (+ caminho)
src/routes/app-routes.tsx      (+ rota)
```

Se a feature é só uma ação nova num domínio existente (por exemplo, arquivar um
quadro), o caminho é o mesmo, mas menor: endpoint → service → hook → botão.

## Antes de dizer que acabou

- [ ] `npm run typecheck` limpo
- [ ] `npm run lint` — 0 erros, e nenhum aviso novo além dos 3 conhecidos
- [ ] `npm run format` rodado nos arquivos tocados
- [ ] nenhum componente importando de `services/`, `axios` ou `@/api/http`
- [ ] toda URL nova em `endpoints.ts`, toda chave nova em `queryKeys`
- [ ] mutation invalida tudo que ela afeta (inclusive listas de outro domínio —
      remover um membro muda os cartões dele)
- [ ] carregando, erro e vazio tratados na tela
- [ ] mensagens em português
- [ ] testado no navegador, não só compilando
