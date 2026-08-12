# UI

## shadcn/ui sobre Base UI — não Radix

Este é o ponto que mais confunde: o projeto usa shadcn/ui na variante **Base
UI**, não Radix. A maior parte dos exemplos que você acha na internet é de
Radix, e a API é diferente. Confira em `components.json`: `"style":
"base-lyra"`.

**A diferença que aparece toda hora:** Radix usa `asChild`, Base UI usa `render`.

```tsx
// ✗ Radix — não funciona aqui
<DialogTrigger asChild><Button>Abrir</Button></DialogTrigger>

// ✓ Base UI
<DialogTrigger render={<Button />}>Abrir</DialogTrigger>
```

Vale para todos os triggers e closes: `DialogTrigger`, `DialogClose`,
`SheetTrigger`, `AlertDialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`,
`TooltipTrigger`, `SidebarMenuButton`, `Badge`, `Item`.

Quando o `render` troca o elemento por algo que **não é** um `<button>`, avise:

```tsx
<Button variant="ghost" nativeButton={false} render={<Link to={PATHS.boards} />}>
  Voltar aos quadros
</Button>
```

Outras diferenças (Select com `items`, ToggleGroup com `multiple`, Slider
escalar, Accordion) estão em `.agents/skills/shadcn/rules/base-vs-radix.md`.

## `src/components/ui/**` é vendor

Esses arquivos são gerados pelo CLI do shadcn e **sobrescritos a cada
`shadcn add`**. Editar à mão significa perder a mudança na próxima atualização.

Para adicionar um componente:

```bash
npx shadcn@latest add <componente>
```

O catálogo está em [SHADCN-UI.md](SHADCN-UI.md). Instale só o que for usar.

Precisa de um comportamento diferente? Nesta ordem:

1. `className` — cobre a maioria dos casos, e o `cn` resolve os conflitos;
2. composição — envolva o primitivo num componente seu em
   `components/common/` ou na pasta do domínio (é o que `PasswordInput`,
   `UserAvatar` e `ConfirmDialog` fazem);
3. só em último caso, editar o arquivo em `ui/` — e deixando um comentário
   dizendo o que foi mudado, para sobreviver ao próximo `add`.

O ESLint já desliga a regra `react-refresh/only-export-components` dentro de
`ui/`, porque esses arquivos exportam variantes e helpers junto do componente
por design.

## Classes: `cn` e `cva`

`cn` (`lib/utils.ts`) junta `clsx` com `tailwind-merge`. Use sempre que a classe
for condicional ou vier por prop — é o que faz `className` do consumidor vencer
o padrão do componente em vez de brigar com ele:

```tsx
<div className={cn("rounded-md border p-4", isActive && "border-primary", className)} />
```

`cva` é para componentes com variantes fechadas (veja `ui/button.tsx`). Se você
está escrevendo um `if` para escolher entre três strings de classe, provavelmente
queria um `cva`.

O `prettier-plugin-tailwindcss` ordena as classes sozinho, inclusive dentro de
`cn()` e `cva()` — não ordene à mão.

## Cores e tema

Nunca use cor literal do Tailwind (`bg-zinc-900`, `text-white`) em componente do
app. Use os tokens semânticos, que já viram claro ou escuro sozinhos:
`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`,
`border-border`, `bg-primary`, `text-destructive`, `bg-sidebar`.

Os tokens estão em `src/index.css`, e a fonte é a Outfit Variable
(`font-sans` e `font-heading`).

O tema vem do `ThemeProvider` (`contexts/theme-provider.tsx`), que guarda a
escolha em `localStorage`, aceita `system`, acompanha o `prefers-color-scheme` em
tempo real e sincroniza entre abas. Para ler ou trocar, `useTheme()`
(`hooks/use-theme.ts`). Há um atalho: apertar **d** fora de um campo de texto
alterna claro/escuro.

## Ícones

`lucide-react`, importados pelo nome, com sufixo `Icon`:

```tsx
import { PlusIcon, Trash2Icon } from "lucide-react"
```

Ícone dentro de um botão com texto leva `data-icon="inline-start"` (ou
`inline-end`) para o espaçamento correto:

```tsx
<Button><PlusIcon data-icon="inline-start" />Nova equipe</Button>
```

Quando o nome do ícone só é conhecido em runtime — o ícone que a pessoa escolheu
para o quadro ou a equipe — use `DynamicIcon`, sempre com um fallback:

```tsx
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

<DynamicIcon name={(team.icon ?? "building-2") as IconName} aria-hidden className="size-4" />
```

Botão só de ícone precisa de `aria-label`.

## Feedback e estados de tela

**Toast** só através de `toastSuccess` / `toastApiError`
(`lib/api-feedback.ts`), e disparado pelo hook, não pelo componente. Nunca chame
`toast.add` direto.

**Confirmação de ação destrutiva** usa `ConfirmDialog`
(`components/common/confirm-dialog.tsx`). Quando a exclusão exige digitar o nome
para confirmar, existem `DeleteBoardDialog` e `DeleteTeamDialog`.

**Os três estados de uma tela que carrega dado** — trate os três, sempre:

| Estado | Componente |
|---|---|
| carregando | `Skeleton`, no formato do conteúdo que vai aparecer |
| erro | `ErrorState`, com `onRetry` |
| vazio | `Empty`, com título, explicação e o botão da ação principal |

O estado vazio é o que a pessoa vê no primeiro acesso. Ele merece um texto que
explique o que fazer, como o de `teams-page.tsx`: "Os quadros moram dentro de uma
equipe. Crie a primeira para começar."

## Layout

`AppLayout` (sidebar + topbar) envolve as rotas internas; `AuthLayout` cobre
login e cadastro. A sidebar é o `ui/sidebar.tsx` do shadcn, dirigida por
`app-sidebar.tsx`, e usa `useSidebar()` para fechar sozinha no mobile depois de
navegar. Para saber se está em tela pequena, `useIsMobile()` (`hooks/use-mobile.ts`).

Estado de UI que precisa sobreviver a um F5 ou a um link colado vai para a
**URL**, não para `useState`: o cartão aberto é uma rota
(`/boards/:boardId/cards/:cardId`) e os dialogs de configuração são search params
(`?settings=geral`, `?perfil=…`).
