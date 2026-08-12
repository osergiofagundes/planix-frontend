# Arquitetura

## A ideia em uma frase

Cada camada só conhece a de baixo, e a UI nunca sabe que existe HTTP.

```
┌─────────────────────────────────────────────┐
│  pages/ + components/     "o que aparece"   │
│  não sabe o que é axios, URL ou token       │
└──────────────────┬──────────────────────────┘
                   │ chama hooks
┌──────────────────▼──────────────────────────┐
│  hooks/                   "quando busca"    │
│  TanStack Query: cache, invalidação, toast  │
└──────────────────┬──────────────────────────┘
                   │ chama services
┌──────────────────▼──────────────────────────┐
│  services/                "o que pede"      │
│  uma função por operação da API, tipada     │
└──────────────────┬──────────────────────────┘
                   │ usa o cliente
┌──────────────────▼──────────────────────────┐
│  api/                     "como pede"       │
│  axios, endpoints, token, erro normalizado  │
└─────────────────────────────────────────────┘

transversais: types/  schemas/  lib/
```

O ganho prático: dá para trocar axios por fetch mexendo em `api/`; dá para mudar
a estratégia de cache mexendo em `hooks/`; e um componente pode ser lido sem
saber nada de rede.

## O que cada pasta faz

| Pasta | Responsabilidade | Pode importar | Não pode importar |
|---|---|---|---|
| `api/` | cliente axios, catálogo de URLs, normalização de erro | `types/`, `lib/` | `services/`, `hooks/`, `components/` |
| `services/` | uma função por operação da API, entrada e saída tipadas | `api/`, `types/`, `lib/` | React, `hooks/`, `components/` |
| `hooks/` | queries e mutations, chaves de cache, invalidação, toast | `services/`, `lib/`, `types/`, `contexts/` | `components/`, `pages/` |
| `contexts/` | estado global de sessão: auth, equipe ativa, tema | `hooks/`, `services/`, `lib/`, `types/` | `pages/` |
| `components/ui/` | primitivos do shadcn (**vendor**) | `lib/utils` | qualquer coisa do app |
| `components/common/` | genéricos do app, reusados por vários domínios | `ui/`, `lib/`, `types/`, `hooks/` | `services/`, `api/` |
| `components/<domínio>/` | UI de um domínio (board, card, team, profile…) | `ui/`, `common/`, `hooks/`, `schemas/`, `types/`, `lib/` | `services/`, `api/` |
| `pages/` | monta uma rota a partir de componentes e hooks | tudo acima | `services/`, `api/` |
| `layouts/` | casca compartilhada por um grupo de rotas | `components/`, `hooks/` | `services/`, `api/` |
| `routes/` | mapa de URLs e guards de acesso | `pages/`, `layouts/`, `hooks/` | `services/` |
| `schemas/` | validação Zod dos formulários | nada do app | qualquer camada |
| `types/` | contratos da API + constantes, labels e guards de domínio | outros `types/` | qualquer camada |
| `lib/` | utilitários puros e infra de cliente | `types/` | `services/`, `hooks/`, `components/` |

**Única exceção tolerada:** páginas e componentes importam `normalizeApiError`
de `@/api/api-error` para renderizar o erro de uma query (ver `ErrorState`). É
uma função pura de formatação, não um caminho para a rede.

## O caminho de um dado, de ponta a ponta

Abrir `/boards` e ver a lista de quadros:

**1. A página pede o dado** — `pages/boards-page.tsx`

```tsx
const boards = useBoards(activeTeam?.id)
```

A página não sabe de URL, token, retry ou cache. Ela recebe
`isPending`/`isError`/`data` e decide o que desenhar.

**2. O hook decide quando buscar e sob qual chave** — `hooks/use-boards.ts`

```ts
export function useBoards(teamId?: number) {
  return useQuery({
    queryKey: teamId ? queryKeys.boards.byTeam(teamId) : queryKeys.boards.all,
    queryFn: () => boardService.list(teamId),
  })
}
```

**3. O service traduz para uma chamada HTTP** — `services/board.service.ts`

```ts
async list(teamId?: Id): Promise<BoardResponse[]> {
  const { data } = await api.get<BoardResponse[]>(API_ENDPOINTS.boards.root, {
    params: teamId ? { teamId } : undefined,
  })
  return data
}
```

A URL vem do catálogo, nunca de uma string literal. O tipo de retorno é o
contrato de `types/board.types.ts`.

**4. O cliente cuida do resto** — `api/http.ts`

O interceptor de request injeta o `Authorization`. O de response trata 401:
renova o token e repete a chamada uma vez; se não der, encerra a sessão. Nada
disso aparece nas camadas de cima. Detalhes em [CAMADA-API.md](CAMADA-API.md).

**5. A volta.** O TanStack Query guarda o resultado sob a `queryKey`, e qualquer
outro componente que chame `useBoards` com a mesma chave recebe o dado do cache,
sem nova requisição. Quando uma mutation invalida `queryKeys.boards.all`, todo
mundo que depende dessa chave rebusca sozinho.

## Estado: quem guarda o quê

O projeto não tem Redux, Zustand ou similar — e não precisa, porque cada tipo de
estado tem um dono claro:

- **Estado do servidor** (quadros, cartões, membros…) → **TanStack Query**. É a
  única fonte de verdade. Não copie resposta de API para `useState`.
- **Sessão** (usuário logado, equipe ativa, tema) → **Context**, em
  `contexts/`. São três: `auth`, `team`, `theme`.
- **Estado de tela** (dialog aberto, item em edição) → `useState` local, no
  componente mais próximo de quem usa.
- **Estado que precisa sobreviver a um F5 ou a um link compartilhado** → **a
  URL**. É por isso que o dialog de cartão é uma rota
  (`/boards/:boardId/cards/:cardId`) e as configurações são um search param
  (`?settings=geral`).

## Por que camada técnica e não feature

A alternativa comum é agrupar por feature (`features/board/` com seus
components, hooks e services dentro). Aqui a escolha foi por camada, e ela é
deliberada:

- os domínios do Planix são **fortemente acoplados por natureza** — cartão
  depende de lista, que depende de quadro, que depende de equipe. Fatiar em
  features criaria dependência cruzada entre fatias, que é justamente o que a
  organização por feature promete evitar;
- o `services/` espelha os controllers do backend quase 1:1, o que torna óbvio
  onde mexer quando a API muda;
- a regra de dependência fica visível na árvore de pastas: dá para verificar uma
  violação só de olhar o caminho do import.

Se o projeto crescer a ponto de `hooks/` ou `components/` ficarem difíceis de
navegar, a migração para feature-sliced é possível — mas é uma decisão a tomar
de uma vez, não aos poucos. Meio caminho é pior que qualquer um dos dois.
