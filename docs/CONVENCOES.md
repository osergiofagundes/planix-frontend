# Convenções

## Arquivos

Sempre **kebab-case**, inclusive para arquivos que exportam um componente:
`board-form-dialog.tsx`, não `BoardFormDialog.tsx`.

| Camada | Padrão | Exemplo |
|---|---|---|
| service | `<domínio>.service.ts` | `board.service.ts` |
| tipos | `<domínio>.types.ts` | `board.types.ts` |
| schema | `<domínio>.schema.ts` | `board.schema.ts` |
| hook | `use-<assunto>.ts` | `use-boards.ts` |
| contexto | `<nome>-context.ts` + `<nome>-provider.tsx` | `auth-context.ts` |
| página | `<nome>-page.tsx` | `boards-page.tsx` |
| componente | `<nome>.tsx`, dentro da pasta do domínio | `board/board-card.tsx` |

Componente de domínio leva o domínio no nome (`board-card.tsx`,
`card-checklist.tsx`). Repetir o nome da pasta parece redundante na árvore, mas
é o que torna a aba do editor e a busca por arquivo legíveis.

## Exports

- **Nomeados, sempre.** `export default` só existe onde o Vite exige (`App.tsx`).
- Um componente por arquivo, mais os subcomponentes privados que só ele usa
  (veja `TeamCard` e `TeamsSkeleton` dentro de `teams-page.tsx`). Se um
  subcomponente passar a ser usado por outro arquivo, ele ganha arquivo próprio.
- Service: um objeto por domínio, `camelCase` — `boardService`, `cardService`.
- Hook: verbo no nome quando é mutation — `useBoards` (query),
  `useCreateBoard`, `useDeleteBoard` (mutations).
- Tipo de API: espelha o nome do DTO do backend — `BoardResponse`,
  `BoardRequest`, `BoardCreateRequest`. Se o backend renomear, renomeie aqui.

## Imports

Duas coisas importam, nesta ordem:

**1. Sempre o alias `@/`**, nunca caminho relativo entre pastas
(`../../lib/utils`). Só arquivos irmãos de uma mesma pasta podem usar `./`.

**2. Dois grupos, separados por uma linha em branco:** primeiro pacotes
externos, depois tudo que começa com `@/`. Dentro do grupo `@/`, ordene por
caminho.

```ts
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { useBoards } from "@/hooks/use-boards"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"
```

Tipos usam `import type` (o `verbatimModuleSyntax` está ligado, então isso não é
opcional). Quando um arquivo importa valor e tipo do mesmo módulo, junte:

```ts
import { ACCEPTED_AVATAR_TYPES, type ProfileResponse } from "@/types/profile.types"
```

Nada disso é verificado por ferramenta — é revisão de código.

## Onde mora cada constante

Esta é a pergunta que mais gera dúvida. A regra:

| A constante é… | Vai para |
|---|---|
| um contrato ou limite do domínio, que a UI e o service usam | `types/<domínio>.types.ts` |
| um rótulo em português de um enum da API | `types/<domínio>.types.ts` |
| uma URL da API | `api/endpoints.ts` |
| uma chave de cache | `queryKeys`, em `lib/query-client.ts` |
| um caminho de rota | `routes/paths.ts` |
| uma regra de validação de formulário | `schemas/<domínio>.schema.ts` |
| um detalhe visual usado só por um componente | o próprio componente |

Exemplos no código: `BOARD_VISIBILITY_LABELS` e `MAX_ATTACHMENT_BYTES` em
`types/`; `TEAM_ROLE_LABELS` e o guard `isTeamAdmin` em `types/team.types.ts`;
`MIN_ZOOM`/`MAX_ZOOM` no topo de `avatar-crop-dialog.tsx`, porque só ele usa.

**Constante de domínio nunca mora em `services/`.** O service é transporte; quem
precisa do limite é a UI, e a UI não pode importar de `services/`.

## Comentários

Em português, e explicando **por quê**. O código já diz o quê.

```ts
// Em produção o valor é "" de propósito: o nginx faz proxy de /api para o
// backend, então o axios monta URLs relativas à origem da página.
const baseURL = import.meta.env.VITE_API_URL || ""
```

Isso é útil: sem o comentário, alguém "conserta" a string vazia e quebra a
produção. Já `// cria o cliente axios` acima de `axios.create` é ruído.

Bloco `catch` vazio **precisa** de um comentário dizendo por que o erro é
ignorado — sem ele o ESLint reclama, e com razão.

Use `/** … */` para documentar uma exportação cujo uso não é óbvio:

```ts
/** Sem `teamId`, traz todos os quadros a que você tem acesso, em todas as equipes. */
export function useBoards(teamId?: number) {
```

## Estilo

Prettier decide formatação; não discuta com ele. A configuração
(`.prettierrc`): sem ponto e vírgula, aspas duplas, 80 colunas, 2 espaços,
vírgula final estilo ES5. O plugin `prettier-plugin-tailwindcss` ordena as
classes do Tailwind sozinho, inclusive dentro de `cn()` e `cva()`.

Outros hábitos que o código segue:

- `interface` para objetos, `type` para união e alias.
- Retorno cedo em vez de `else` aninhado.
- Funções auxiliares no fim do arquivo, depois do que exportam.
- Nada de `any`. Se o tipo é desconhecido, `unknown` e um guard.
