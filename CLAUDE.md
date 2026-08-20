# CLAUDE.md

Instruções para trabalhar neste repositório. Leia inteiro antes de mexer no
código — é curto de propósito. O detalhe está em [`docs/`](docs/README.md).

## O projeto

Planix é um gerenciador de tarefas no estilo Trello: equipes → quadros → listas
→ cartões. Este repositório é só o frontend; ele consome a API Spring Boot que
vive em `../planix`.

**Dois backends.** Tudo em `/api/*` vem do `../planix`, com uma exceção:
`/api/notifications` e o WebSocket `/ws/` vêm do `../planix-realtime`. Em produção
o nginx roteia por caminho e o navegador não percebe a diferença; em dev o
`notification.service.ts` prefixa com `VITE_REALTIME_URL` (só existe em dev — em
produção a variável é vazia, como `VITE_API_URL`).

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/ui sobre
**Base UI** (não Radix) · TanStack Query · React Hook Form + Zod · React Router 7
· axios · dnd-kit.

## Comandos

```bash
npm run dev        # Vite em http://localhost:5173
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
npm run format     # prettier --write
npm run build      # tsc -b && vite build
```

**Antes de dar qualquer coisa por pronta:** `npm run typecheck` e `npm run lint`
precisam passar. A linha de base é **0 erros e 3 avisos** de
`react-hooks/exhaustive-deps` (conhecidos, em `board-form-dialog`,
`team-form-dialog` e `accept-invite-page`). Erro novo, ou aviso novo, é
regressão. Rode `npm run format` no que você tocou.

Para rodar em Docker (produção na 5173, dev na 5174), veja o
[README](README.md).

## Mapa do `src/`

```
api/         axios, catálogo de endpoints, normalização de erro
services/    chamadas HTTP por domínio, tipadas — sem React
hooks/       TanStack Query (queries, mutations, cache) e estado de tela
contexts/    auth, team e theme — contexto e provider em arquivos separados
components/
  ui/        vendor do CLI do shadcn — NÃO EDITAR À MÃO
  common/    componentes genéricos do app (confirm-dialog, user-avatar, …)
  <domínio>/ board/, card-detail/, team/, profile/, layout/, …
pages/       uma por rota
layouts/     casca das rotas (app-layout, auth-layout)
routes/      paths, patterns e guards (protected-route, public-route)
schemas/     Zod — validação de formulário
types/       contratos da API + constantes, labels e guards de domínio
lib/         utilitários puros e infra de cliente (storage, cache, máscaras)
```

## Regra de dependência

```
api/  ──▶  services/  ──▶  hooks/  ──▶  components/ + pages/
```

Cada camada só conhece a de baixo. `types/`, `schemas/` e `lib/` são
transversais: qualquer camada pode importá-los, e eles não importam ninguém
acima de si.

**Proibido:**

- componente ou página importando de `services/`, de `axios` ou de `@/api/*`
  (exceto `normalizeApiError`, que é usado para renderizar erro de query)
- `services/` importando de `hooks/`, de `components/` ou de React
- `lib/` importando de `services/`, `hooks/` ou `components/`
- qualquer arquivo fora de `hooks/` chamando `useQuery`/`useMutation`

Se você precisa de um dado numa tela, o caminho é sempre um hook. Sem exceção.

## Regras invioláveis

1. **`src/components/ui/**` é vendor.** É gerado pelo CLI do shadcn e
   sobrescrito a cada `shadcn add`. Não edite à mão — para variar algo, componha
   por fora ou passe `className`.
2. **Todo erro de API passa por `normalizeApiError`** (`@/api/api-error`). Nunca
   leia `error.response.data` na mão.
3. **URL de API só nasce em `src/api/endpoints.ts`.** Service nunca escreve
   string de rota literal.
4. **Toda query nova registra sua chave em `queryKeys`**
   (`src/lib/query-client.ts`). Nada de array de chave solto no meio do código.
5. **Toast de erro é do hook, não da UI** — via `toastApiError`. Exceção
   deliberada: mutations usadas por formulário **não** dão toast de erro, porque
   o próprio formulário mostra a mensagem. Veja `docs/FORMULARIOS.md`.
6. **Texto de UI, mensagem de erro e comentário em português.** Código
   (identificadores) em inglês.
7. **Comentário explica *por quê*, não *o quê*.** O código já diz o que faz. Se
   não há nada não-óbvio a explicar, não comente.
8. **Prettier:** sem ponto e vírgula, aspas duplas, 80 colunas, 2 espaços.
   `npm run format` resolve.
9. **Nunca execute `git commit` nem `git push`.** Termine a tarefa, deixe
   as alterações prontas na árvore de trabalho e pare aí.

## Onde olhar

| Você vai… | Leia |
|---|---|
| entender a estrutura e o fluxo de dados | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| **implementar uma feature nova** | [`docs/NOVA-FEATURE.md`](docs/NOVA-FEATURE.md) |
| mexer em nome de arquivo, export ou import | [`docs/CONVENCOES.md`](docs/CONVENCOES.md) |
| mexer em HTTP, token, cache ou erro | [`docs/CAMADA-API.md`](docs/CAMADA-API.md) |
| criar ou alterar um formulário | [`docs/FORMULARIOS.md`](docs/FORMULARIOS.md) |
| mexer em componente, tema ou ícone | [`docs/UI.md`](docs/UI.md) |
| achar um componente do shadcn | [`docs/SHADCN-UI.md`](docs/SHADCN-UI.md) |

## Ao terminar

- Camadas respeitadas, chave de cache registrada, endpoint no catálogo.
- Estados de **carregando**, **erro** e **vazio** tratados na tela — o projeto
  usa `Skeleton`, `ErrorState` e `Empty` para isso.
- `npm run typecheck` e `npm run lint` limpos.
