# Planix — Frontend

Interface web do Planix, o gerenciador de tarefas no estilo Trello. Consome a API em [`planix`](../planix).

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query · React Hook Form + Zod · React Router · Docker

## Pré-requisitos

- **Node 24** (só para o fluxo local)
- **Docker** e **Docker Compose 2.24+** (só para os fluxos em container)

Há dois ambientes que rodam **ao mesmo tempo**, em portas separadas:

| Ambiente | URL | Como fala com a API | Sobe no boot? |
|---|---|---|---|
| **Produção** | `http://localhost:5173` | nginx faz proxy de `/api` → `app:8080` | sim (`restart: always`) |
| **Desenvolvimento** | `http://localhost:5174` | direto em `http://localhost:8081` (CORS) | não (`restart: "no"`) |

Em produção **não há CORS**: como o nginx repassa `/api` para o backend, o
navegador conversa com a API na mesma origem. Em dev o Vite serve os arquivos e
o navegador chama o backend direto, então a origem `http://localhost:5174`
precisa estar em `planix.cors.allowed-origins` no backend.

## Antes da primeira execução

Copie `.env.example` para `.env`:

```bash
cp .env.example .env          # no Windows: copy .env.example .env
```

## Rodando localmente

```bash
npm install
npm run dev
```

## Produção

Build servido por nginx. Sobe uma vez e volta sozinho a cada boot, junto com o
Docker Desktop:

```bash
docker compose up -d --build
```

Depende da rede `planix-net`, criada pelo stack do backend — **suba o backend
antes** (`../planix`, `docker compose --profile app up -d --build`). Sem isso o
Compose falha com `network planix-net ... could not be found`.

## Desenvolvimento

```powershell
.\scripts\dev-up.ps1 -d       # projeto planix-frontend-2-dev, em 5174
.\scripts\dev-down.ps1        # derruba só o dev; a produção segue no ar
```

Precisa do backend de dev no ar (`..\planix\scripts\dev-up.ps1 -d`, porta 8081).

Use os scripts em vez do comando cru: rodar
`docker compose -f compose.yaml -f compose.dev.yaml up` **sem**
`-p planix-frontend-2-dev` substituiria o container de produção.

A primeira subida demora: o `node_modules` do host é do Windows, então o container
instala as dependências Linux num volume próprio. As seguintes reaproveitam esse volume.

### VITE_API_URL é variável de BUILD

O Vite resolve `import.meta.env` durante o `vite build` e grava o valor dentro do
bundle — mudar só o `environment` de um container que serve arquivos estáticos
não tem efeito.

Em produção o valor é **`""`**, fixo no `compose.yaml`: com a string vazia o
axios monta URLs relativas (`/api/...`), que é o que o proxy do nginx espera. O
`.env` existe apenas para o modo dev. Depois de qualquer rebuild, dê um
hard-refresh (Ctrl+Shift+R) — senão o navegador reusa o bundle antigo.

Só preencha `VITE_API_URL` no build se um dia o front for servido numa origem
diferente da API:

```bash
docker compose build --build-arg VITE_API_URL=https://api.exemplo.com
```

### Comandos úteis

```bash
docker compose ps                            # o que está no ar
docker compose logs -f web                   # logs do frontend
docker compose down                          # derruba os containers
```

## Qualidade

```bash
npm run typecheck      # tsc -b --noEmit
npm run lint           # eslint
npm run format         # prettier --write
```