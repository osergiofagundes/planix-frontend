# Camada de API e cache

O que está aqui já funciona e é sutil. Antes de mexer, entenda por que está
assim — vários detalhes existem para resolver um problema específico.

## `api/http.ts` — o cliente

### A baseURL vazia em produção

```ts
const baseURL = import.meta.env.VITE_API_URL || ""
```

Em produção o valor é `""` **de propósito**: o nginx faz proxy de `/api` para o
backend, então o axios monta URLs relativas (`/api/boards`) na mesma origem da
página — e não existe CORS. Em dev, `VITE_API_URL` aponta para
`http://localhost:8081` e o navegador chama o backend direto.

`VITE_API_URL` é variável de **build**, não de runtime: o Vite grava o valor
dentro do bundle durante `vite build`. Mudar o `environment` de um container que
serve arquivos estáticos não tem efeito nenhum. Detalhes no [README](../README.md).

### Dois clientes, não um

```ts
export const api = axios.create({ baseURL, headers, timeout: 30_000 })
const refreshClient = axios.create({ baseURL, headers, timeout: 30_000 })
```

O `refreshClient` não tem os interceptors. Se a chamada de refresh usasse o `api`
e ela mesma respondesse 401, o interceptor tentaria renovar o token para poder
renovar o token — recursão infinita.

### Request: quem leva token

```ts
api.interceptors.request.use((config) => {
  if (isPublicEndpoint(config.url)) return config
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`)
  return config
})
```

`PUBLIC_ENDPOINTS` (login, cadastro, refresh) não recebem `Authorization`.

### Response: o refresh de token

O trecho mais delicado do projeto. Num 401, o interceptor:

1. ignora se a chamada era para endpoint público — esse 401 é legítimo
   ("senha errada"), não sessão expirada;
2. se a requisição **já** foi repetida (`config._retry`), encerra a sessão. Uma
   tentativa só, senão dá laço;
3. se não há refresh token guardado, encerra a sessão;
4. renova o token, refaz a chamada original com o token novo e devolve o
   resultado — para as camadas de cima, nada aconteceu.

**A parte que não pode ser removida:**

```ts
let refreshPromise: Promise<string> | null = null

function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
```

Uma tela abre cinco queries de uma vez. Se o token expirou, as cinco recebem 401
quase juntas. Sem essa promise compartilhada, seriam cinco chamadas de refresh
simultâneas — e como o backend rotaciona o refresh token, quatro delas usariam
um token já invalidado e derrubariam a sessão. Com ela, a primeira renova e as
outras quatro esperam o mesmo resultado.

### O fim da sessão

```ts
function endSession(): void {
  tokenStorage.clear()
  emitAuthLogout()
}
```

`api/http.ts` não pode chamar `navigate` — não é um componente React. Em vez
disso dispara o evento `planix:auth-logout` no `window`. Quem escuta é o
`AuthProvider`, que limpa o cache e navega para o login. É o que mantém a camada
de API independente do React.

## `api/api-error.ts` — o erro normalizado

Todo erro vira o mesmo formato, venha do backend, da rede ou do JavaScript:

```ts
interface NormalizedApiError {
  status: number          // 0 quando não houve resposta
  message: string         // sempre preenchida, sempre em português
  fieldErrors: Record<string, string>
  isNetworkError: boolean
}
```

Nunca leia `error.response.data` na mão. Sempre `normalizeApiError(error)`.

`fieldErrors` é o que o backend devolve por campo (`{ "name": "Já existe um
quadro com esse nome." }`) e é o que alimenta `applyApiFieldErrors` nos
formulários.

## `lib/api-feedback.ts` — o toast

```ts
toastApiError(error, "Não foi possível excluir o quadro")
toastSuccess("Quadro criado.", board.name)
```

`toastApiError` normaliza, escolhe o título pelo status (403 → "Ação não
permitida", 404 → "Não encontrado", 409 → "Conflito", 5xx → "Erro no servidor")
e devolve o erro normalizado, caso você ainda precise dele.

**Ele engole o 401 de propósito:** nesse caso o interceptor já está renovando o
token ou derrubando a sessão. Um toast de "não autorizado" só apareceria junto
com a tela de login, confundindo.

Não chame `toast.add` direto de um componente — passe por estes dois.

## Cache: `lib/query-client.ts`

### Configuração padrão

```ts
queries: {
  retry: shouldRetry,          // não repete 4xx; até 2 tentativas no resto
  staleTime: 30_000,
  refetchOnWindowFocus: false,
}
mutations: { retry: false }
```

Repetir um 404 ou um 403 é desperdício: a resposta não vai mudar. Já um 500 ou
uma falha de rede podem ser transitórios.

### Invalidar vs. escrever

- `invalidateQueries` — "isso pode ter mudado, rebusque". Use em listas.
- `setQueryData` — "eu já sei o valor novo". Use quando a mutation devolveu o
  objeto atualizado, para a tela não piscar.
- `removeQueries` — "isso não existe mais". Use depois de excluir, senão o
  cache guarda um fantasma.

Pense no **efeito real** da mutation, não só no objeto que ela mexeu. Trocar a
visibilidade de um quadro muda quem são seus membros; remover um membro muda os
cartões em que ele era responsável. Ambos os casos estão em `use-boards.ts`.

## Atualização otimista (drag and drop)

Arrastar um cartão precisa ser instantâneo. O padrão completo está em
`useMoveCard` (`hooks/use-cards.ts`):

```ts
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: sourceKey })   // 1
  const sourceSnapshot = queryClient.getQueryData(sourceKey) ?? []  // 2
  queryClient.setQueryData(sourceKey, moveWithin(sourceSnapshot, from, to))  // 3
  return { sourceSnapshot }                                   // 4
},
onError: (error, variables, context) => {
  queryClient.setQueryData(sourceKey, context.sourceSnapshot) // 5
  toastApiError(error, "Não foi possível mover o cartão")
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: sourceKey })      // 6
},
```

1. cancela buscas em voo — senão uma resposta antiga chega depois e desfaz o
   movimento na tela;
2. guarda o estado atual;
3. escreve o resultado esperado; a UI atualiza na hora;
4. devolve o snapshot como contexto;
5. deu erro, volta ao snapshot;
6. certo ou errado, no fim rebusca — a verdade é do servidor.

Os helpers de reordenação (`lib/reorder.ts`) são funções puras:
`moveWithin(itens, de, para)`, `moveBetween(origem, destino, de, para)` e
`withPositions`, que renumera `position` para bater com o índice.
`lib/card-cache.ts` tem os atalhos para escrever um cartão nos dois caches em
que ele aparece (o detalhe e a lista).

## `lib/token-storage.ts`

Guarda os tokens no `localStorage` sob `planix.accessToken` e
`planix.refreshToken`, com `try/catch` em toda operação: em modo privado ou com
a cota estourada, o `localStorage` lança exceção, e o app deve continuar
funcionando na aba atual em vez de quebrar. Exporta também o evento
`AUTH_LOGOUT_EVENT` e `emitAuthLogout()`.
