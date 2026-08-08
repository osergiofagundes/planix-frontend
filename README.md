# Planix — Frontend

Interface web do Planix, o gerenciador de tarefas no estilo Trello. Consome a API em [`planix`](../planix).

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query · React Hook Form + Zod · React Router · Docker

## Pré-requisitos

- **Node 24** (só para o fluxo local)
- **Docker** e **Docker Compose 2.24+** (só para os fluxos em container)

Em todos os modos abaixo o app sobe em `http://localhost:5173`. Essa porta não é
escolha estética: é a origem que o CORS do backend libera
(`planix.cors.allowed-origins`). Mudar a porta exige liberar a nova origem lá.

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

## Rodando via Docker

Build de produção servido por nginx:

```bash
docker compose up --build
```

### Modo dev (hot reload)

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

A primeira subida demora: o `node_modules` do host é do Windows, então o container
instala as dependências Linux num volume próprio. As seguintes reaproveitam esse volume.

### VITE_API_URL é variável de BUILD

O Vite resolve `import.meta.env` durante o `vite build` e grava o valor dentro do
bundle. No modo de produção, trocar a URL da API **exige reconstruir a imagem**:

```bash
VITE_API_URL=https://api.exemplo.com docker compose up --build
```

Mudar só o `environment` de um container que serve arquivos estáticos não tem efeito.

### Comandos úteis

```bash
docker compose ps                            # o que está no ar
docker compose logs -f web                   # logs do frontend
docker compose down                          # derruba os containers
docker compose down -v                       # derruba e APAGA o node_modules do dev
```

## Qualidade

```bash
npm run typecheck      # tsc -b --noEmit
npm run lint           # eslint
npm run format         # prettier --write
```