# Central de Notificações — o que foi construído

> Este documento cobre os **três** repositórios do Planix, não só o frontend. Ele mora aqui
> porque é onde o desenho ([`notificacao.md`](notificacao.md)) já morava. A diferença entre os
> dois: aquele descreve o que se **pretendia** fazer; este descreve o que **existe**, com o
> motivo de cada escolha e o registro do que quebrou no caminho.

## A ideia em uma frase

O Planix grava o que aconteceu **na mesma transação da regra de negócio**, e um serviço separado
transforma isso em inbox e em push.

Tudo o mais é consequência dessa frase. Gravar na mesma transação elimina o *dual-write* —
o caso em que o banco commita e a mensagem se perde, ou o contrário, e a notificação some ou
nasce de um fato que não aconteceu. Ser um serviço separado é o que permite o Planix seguir
inteiro quando o outro cai.

```
CardService.move ──▶ NotificationPublisher ──▶ notification_outbox (Postgres)
     └── MESMA TRANSAÇÃO, sem I/O de rede ──┘            │
                                             OutboxRelay @Scheduled 2s
                                                         ▼
                                        Kafka  planix.notifications.v1
                                                         │ @KafkaListener
                                                         ▼
                                 NotificationConsumer ──▶ Cassandra (2 tabelas)
                                              │
                                              └──▶ ConnectionHub ──▶ WebSocket ──▶ sino
```

## O mapa dos três repositórios

| Repositório | Papel | O que ganhou | Tamanho |
|---|---|---|---|
| `planix` | produtor | pacote `notification/`, migration V11, 4 pontos de chamada | 32 arquivos, +2105 linhas, 9 commits |
| `planix-realtime` | consumidor, API e socket | o serviço inteiro | 32 classes + 8 de teste, 10 commits |
| `planix-frontend-2` | consumidor visual | sino, painel, socket, rotas do nginx | 16 arquivos, +820 linhas, 4 commits |

Todos na branch `feat/central-de-notificacoes`.

---

## A pilha, item por item

Toda dependência nova, com a versão que de fato resolveu e o motivo de ser essa:

| Ferramenta | Versão | Por que esta |
|---|---|---|
| Java | 21 | **virtual threads**: thread-por-conexão volta a ser viável, e é o que encerra o argumento "precisa ser Go para milhares de WebSockets" |
| Spring Boot | 4.1.0 | a mesma do `planix`. Traz Jackson 3 (`tools.jackson.databind`) e renomeia starters |
| `spring-boot-starter-kafka` | 4.1.0 (spring-kafka 4.1.0, kafka-clients 4.2.1) | o Boot 4 tem starter próprio; no Boot 3 seria o `spring-kafka` avulso |
| `spring-boot-starter-data-cassandra` | 4.1.0 (Spring Data Cassandra 5.1.0, driver 4.19.3) | `@Table`, `@PrimaryKeyClass`, e o `CqlSession` usado direto no UPDATE com TTL |
| `spring-boot-starter-websocket` | 4.1.0 | WebSocket **nativo**, sem STOMP: o envelope é nosso, e um protocolo a mais não se justifica para um frame só |
| `spring-boot-starter-actuator` | 4.1.0 | **dependência nova** — o `planix` não tem Actuator. Não veio por herança de convenção: o `/actuator/health` e o healthcheck do compose dependem dela |
| jjwt | 0.13.0 | a mesma do `planix`. Aqui **só verifica**, nunca emite |
| springdoc + Scalar | 3.0.3 | a linha 3.0.x é a de Boot 4 / Spring Framework 7; a 2.8.x é de Boot 3 |
| Testcontainers | 2.0.5 | módulos `testcontainers-cassandra` e `testcontainers-kafka` |
| Cassandra | 5 | partição por `user_id` |
| Kafka | `apache/kafka`, modo **KRaft** | sem Zookeeper: um container a menos e uma peça a menos para explicar |

### As três escolhas que carregam peso

**Java e não Go.** O argumento clássico pró-Go era goroutines para milhares de conexões
WebSocket; virtual threads encerraram esse argumento. O que Java entregou aqui e Go cobraria à
mão: retry e dead-letter declarativos, Spring Data Cassandra, `@ServiceConnection` nos
Testcontainers, e o reuso integral das convenções, do Dockerfile e da linha de base de testes
do `planix`. O preço é ~10 s de subida contra ~50 ms, e ~490 MB de RAM contra ~30 MB. O que se
perdeu foi o aprendizado de **linguagem** — objetivo legítimo, mas separado do aprendizado de
arquitetura distribuída, que Java entrega inteiro.

**Um serviço para os dois domínios**, notificação agora e chat depois. Separados, o navegador
manteria duas conexões WebSocket abertas, ou existiria um terceiro componente só para
multiplexar. Os dois compartilham as mesmas peças — hub, ticket, cluster, transporte; o que os
separa é o modelo de dados, e isso é um pacote, não um serviço. Daí o nome ser
`planix-realtime`.

**Sem um `planix-common`.** Biblioteca compartilhada entre microserviços recria o acoplamento
que a separação existe para evitar: mudou o common, redeploya os dois. Compartilha-se o
**contrato**, não o código. O que de fato se duplica são ~50 linhas (verificação de JWT e o
record `ApiError`) — e a seção seguinte mostra como essa duplicação é vigiada.

---

## O contrato do evento

Tópico `planix.notifications.v1` — a versão vive no nome, então quebrar o contrato vira `.v2`,
não uma migração dolorosa. Uma mensagem por evento, com a lista de destinatários **já
resolvida**.

```java
public record NotificationEvent(
        UUID eventId,
        NotificationType type,
        Instant occurredAt,
        List<Long> recipients,
        Actor actor,        // null nos eventos de prazo: não há ator humano
        Ref board,          // null em TEAM_MEMBER_JOINED
        Ref card,           // null em TEAM_MEMBER_JOINED
        Ref team,           // null nos eventos de card
        Map<String, String> data
) {
    public record Actor(Long id, String name, String avatarUrl) {}
    public record Ref(Long id, String name) {}

    public String kafkaKey() {
        return board != null ? "board:" + board.id() : "team:" + team.id();
    }
}
```

Três decisões estão embutidas aí, cada uma com um custo assumido:

1. **`recipients` já resolvido.** O `planix-realtime` nunca precisa saber o que é um membro de
   quadro: sem réplica de dados, sem tópico de membros, sem backfill. O preço é o acoplamento
   migrar para o payload — se a regra de "quem recebe" mudar, eventos já gravados não são
   recalculados.
2. **Contexto denormalizado** (`actor.name`, `board.name`, `card.name`), para o serviço
   renderizar sem nunca chamar o Planix. Consequência assumida: renomear o card depois não muda
   a notificação antiga — o que é **correto**, porque ela é registro histórico, não view.
3. **`occurredAt` e `eventId` vêm do produtor.** É o que torna a escrita idempotente no
   Cassandra. `occurredAt` é `Instant`, e não `OffsetDateTime` como na spec: serializa sempre
   com `Z` e é o tipo que o Spring Data Cassandra mapeia direto para `timestamp`.

**O fallback da chave não é detalhe.** `TEAM_MEMBER_JOINED` não tem quadro, e chave nula no Kafka
cai em *round-robin*: os eventos da mesma equipe se espalhariam pelas partições e perderiam,
**em silêncio**, exatamente a ordenação que a chave existe para dar.

### O golden fixture

A duplicação do record troca um erro de compilação por um erro de runtime: renomear um campo
no `planix` não quebra o build do `planix-realtime` — quebra a desserialização de uma
mensagem, depois, em produção. Dois repositórios não têm compilador em comum, então a proteção
precisou ser escrita à mão.

O mesmo `src/test/resources/contract/notification-event.sample.json` está commitado nos dois.
No `planix` um teste monta o evento à mão, serializa e compara a **árvore** JSON com o fixture;
no `planix-realtime` o teste de mesmo nome desserializa o fixture e afirma que **todo** campo
chegou preenchido. Qualquer divergência quebra o build de um dos dois lados, na hora — é a
única peça que devolve verificação em tempo de build a uma fronteira que a topologia tornou
dinâmica, e é, ela própria, a lição de *contract testing* que dois repositórios cobram.

---

## Lado produtor: `planix`

### Por que outbox e não `KafkaTemplate` no service

Publicar direto de dentro do service cria dual-write. A outbox elimina isso: a linha do evento é
gravada na mesma transação da regra de negócio, **sem nenhum I/O externo**. E isso paga um
segundo benefício, prático e grande: **os testes continuam rodando sem Kafka** —
`./mvnw clean verify` sobe só o Postgres do Testcontainers, e os 135 testes de integração que já
existiam não ganharam dependência nova de infra.

### A tabela — `db/migration/V11__notification_outbox.sql`

```sql
CREATE TABLE notification_outbox (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id   UUID        NOT NULL UNIQUE,
    type       VARCHAR(40) NOT NULL,
    payload    JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at    TIMESTAMPTZ
);

CREATE INDEX idx_outbox_pending ON notification_outbox (id) WHERE sent_at IS NULL;
```

O índice é **parcial**: a fila de pendentes continua barata mesmo com a tabela crescendo, porque
só o que ainda não foi enviado é indexado.

O insert é `insert … on conflict (event_id) do nothing`, e não `save()`. O `save()` do Spring
Data estouraria `DataIntegrityViolationException` no unique e **derrubaria a transação inteira**
do `DueDateScanner`, levando junto os eventos já montados na mesma passada.

### As peças, em `com.sergio.planix.notification/`

| Classe | Responsabilidade |
|---|---|
| `NotificationType` · `NotificationEvent` | o enum dos 6 tipos e o contrato |
| `NotificationOutbox` / `…Repository` | a fila |
| `NotificationPublisher` | **a única porta**: 6 métodos de domínio, e nunca faz I/O de rede — é isso que permite chamá-lo de dentro da transação de um service sem segurar uma conexão de banco esperando a rede |
| `RecipientResolver` | quem recebe cada tipo, já sem o ator |
| `OutboxRelay` | `@Scheduled` de 2 s — drena para o Kafka e poda as enviadas |
| `DueDateScanner` | `@Scheduled` horário — prazos próximos e vencidos |

O resolver só delega: a regra de acesso continua morando nos repositórios de cada domínio. A
query de audiência do quadro é nativa e em `union` porque **espelha** `BoardRepository.hasAccess`
— o JPQL equivalente partiria de `User` e varreria a tabela inteira para só depois filtrar.

### Os quatro pontos de chamada

Uma linha em cada, no fim do método, dentro da transação existente:

| Arquivo | Método | Evento |
|---|---|---|
| `card/CardService.java` | `move`, quando `list_id` muda | `CARD_MOVED` |
| `card/CardAssigneeService.java` | `assign` | `CARD_ASSIGNED` |
| `comment/CommentService.java` | `create` | `CARD_COMMENTED` |
| `invite/TeamInviteService.java` | `accept` | `TEAM_MEMBER_JOINED` |

**Divergência do desenho:** a spec apontava `team/TeamMemberService` para o último. Não é lá
que o `TeamMember` nasce — é em `TeamInviteService.accept`; `TeamMemberService` só remove e
troca papel.

Regra do projeto mantida: service chama service, e o controller não sabe que notificação existe.

### O relay

```java
kafka.send(topico, chaveDe(linha), linha.getPayload()).get(5, TimeUnit.SECONDS);
linha.setSentAt(OffsetDateTime.now());
```

O `.get()` **síncrono** é o ponto do desenho: enviar de forma assíncrona marcaria a linha como
enviada antes de saber se foi. E quando o envio falha, o laço **para** em vez de pular para a
próxima — a passada seguinte retoma dali, preservando a ordem. Kafka fora do ar não quebra
nada: a fila acumula e drena sozinha quando ele voltar.

### O scanner de prazos

Aqui não há ação de usuário para pendurar o evento — o fato é a passagem do tempo. Como ele
roda de hora em hora, a repetição precisa ser inofensiva, e a solução é um `eventId`
determinístico: `UUID.nameUUIDFromBytes("CARD_DUE_SOON:88:1786667325000")`. É UUIDv3 (MD5)
porque o JDK não gera v5, e a diferença não importa num uso não-criptográfico. Determinismo
somado ao insert idempotente dispensa **uma coluna nova em `cards`** só para marcar
"já avisei".

O scanner roda fora de qualquer request, então não há `SecurityContext`: os eventos de prazo
nascem com **ator nulo**, e a frase na tela começa pelo cartão em vez de por uma pessoa.

Por fim, `config/SchedulingConfig`: o projeto não tinha nenhum `@Scheduled`, e sem
`@EnableScheduling` o relay e o scanner ficariam mudos — sem erro, sem log, só ausência de
notificação.

---

## Lado consumidor: `planix-realtime`

### Modelagem Cassandra

```sql
CREATE TABLE IF NOT EXISTS notifications_by_user (
    user_id      bigint,
    occurred_at  timestamp,
    event_id     uuid,
    type         text,
    -- contexto denormalizado do evento
    actor_id bigint, actor_name text, actor_avatar text,
    board_id bigint, board_name text, card_id bigint, card_name text,
    team_id  bigint, team_name  text, data map<text, text>,
    read         boolean,
    PRIMARY KEY ((user_id), occurred_at, event_id)
) WITH CLUSTERING ORDER BY (occurred_at DESC, event_id DESC)
  AND default_time_to_live = 7776000;   -- 90 dias
```

Quatro decisões que importam:

- **Partição por `user_id`.** Toda leitura do inbox é uma partição só. É o desenho que o
  Cassandra recompensa — e é por isso que ele é a escolha certa aqui, e não um Postgres
  esquisito.
- **Chave determinística** (`occurred_at` + `event_id`, ambos do evento). Kafka é
  *at-least-once*: reprocessar acontece. Como o INSERT do Cassandra é upsert e a chave não
  depende do relógio do consumidor, reprocessar é inofensivo. Com `now()` na chave, cada
  reprocessamento criaria uma linha duplicada — **esta é a armadilha do desenho**.
- **Tabela separada `unread_by_user`.** Cassandra não faz `WHERE read = false` sem índice
  secundário, que aqui é antipadrão. Marcar como lida = `DELETE` de lá + `UPDATE` aqui:
  idempotente, e sem o *counter drift* que uma counter column traria sob retry.
- **TTL nativo de 90 dias**, retenção sem job de limpeza.

**Divergência do desenho:** a spec pedia `occurred_at DESC, event_id ASC`, mas o Cassandra recusa
a relação multi-coluna `(occurred_at, event_id) < (?, ?)` quando as direções diferem — e essa
relação é exatamente o cursor de paginação da API. A ordem visível não muda: o desempate por
`event_id` é arbitrário de qualquer jeito.

### Quem cria o schema

O keyspace precisa existir **antes** do contexto subir, porque a sessão do Spring já nasce
ligada a ele. A responsabilidade se divide: o **keyspace** é da infraestrutura (o serviço
`cassandra-init` do compose em produção, um bloco estático na base dos testes); as **tabelas**
são do serviço, via `config/CqlSchemaInitializer`, que lê `cql/V*.cql` em ordem de nome.

É o Flyway do Cassandra escrito à mão, com a mesma disciplina: **arquivo aplicado nunca se
edita**, corrige-se com o próximo. Por isso todo comando é `IF NOT EXISTS` — reexecutar na
subida precisa ser inofensivo.

### O consumidor

```java
@RetryableTopic(attempts = "3", backOff = @BackOff(delay = 1000, multiplier = 2.0))
@KafkaListener(topics = "${planix.notifications.topic}", groupId = "realtime-writer")
public void consumir(String json) { … }
```

`@RetryableTopic` dá retry com backoff e **dead-letter topic** declarativos: o evento que falha
três vezes vai para o DLT em vez de travar a partição para todo mundo atrás dele. Escrever isso
à mão é um dia de trabalho.

Ele consome `String` e desserializa com o `ObjectMapper` do Boot em vez de usar o
`JsonDeserializer` do Spring Kafka. O motivo é o teste: assim o **mesmo** mapper do golden
fixture lê a mensagem, e o teste de contrato exercita o caminho de produção de verdade.

### A API

Todas exigem `Authorization: Bearer <jwt>`, e o `userId` vem **sempre do token**, nunca de
parâmetro — é isso que faz a notificação alheia responder 404.

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/notifications?limit=20&before=<cursor>` | `{ items: [...], nextCursor }` |
| `GET` | `/api/notifications/unread-count` | `{ count: 12, capped: false }` |
| `POST` | `/api/notifications/{id}/read` | 204 |
| `POST` | `/api/notifications/read-all` | 204 |
| `POST` | `/api/notifications/ws-ticket` | `{ ticket, expiresIn: 30 }` |
| `GET` | `/ws/realtime?ticket=<ticket>` | upgrade para WebSocket |
| `GET` | `/actuator/health` | 200 |

O `id` exposto é o composto `"{occurredAtMillis}-{eventId}"` — um único valor que serve de
**identidade**, de **cursor** e de **coordenada** para o UPDATE; separados, seriam três campos
para manter em sincronia.

**O read-all não reusa a query do contador.** O contador para num teto de 100 e a tela mostra
"99+"; se o read-all usasse a mesma consulta, quem tem 300 não-lidas ficaria com 200 depois de
clicar em "marcar todas" — e o botão pareceria quebrado. Ele pagina a partição até o fim, em
lotes de 500, e há um teste com 250 não-lidas só para provar isso. Já o `UPDATE read = true` usa
**`USING TTL` com o tempo restante**, não com o TTL cheio: sem isso a célula ganharia vida nova,
sobreviveria ao resto da linha e deixaria um registro meio apagado no inbox 90 dias depois.

**Limitação assumida e anotada no código:** reprocessar um evento que o usuário já leu devolve
a linha para `unread_by_user`. A janela é o intervalo entre gravar e commitar o offset; a
mitigação barata, quando incomodar, é ler `read` da tabela principal antes de reinserir.

---

## WebSocket

### Por que um ticket, e não o token

O WebSocket nativo do navegador **não permite enviar header `Authorization`**. As saídas ruins
são token na query string — que vaza em log de proxy e no histórico — e abusar do
`Sec-WebSocket-Protocol`. A saída adotada: o frontend chama `POST /api/notifications/ws-ticket`
com o Bearer normal; o `WsTicketService` gera um ticket aleatório e guarda em memória com o
`userId`, **uso único** e 30 s de validade; o navegador conecta em `/ws/realtime?ticket=…` e o
handler resgata, **apaga** o ticket e registra a sessão no hub.

O `remove` do mapa é o que garante o uso único sem janela de corrida. Mesmo vazando num log, o
ticket não serve para nada depois.

### O hub e o frame

`ConcurrentHashMap<Long, Set<WebSocketSession>>` — um **conjunto** de sessões por usuário, para
que várias abas recebam todas. A escrita é `synchronized` na sessão porque o `WebSocketSession`
do Spring não é seguro para escrita concorrente: duas mensagens ao mesmo tempo intercalariam os
frames. Um ping a cada 30 s segura a conexão ociosa viva através do nginx e descarta sessões que
morreram sem avisar.

O frame é `{ "type": "NOTIFICATION_CREATED", "payload": { … } }`. Nasce com envelope justamente
para o chat entrar depois sem quebrar nada: o cliente roteia por `type`, e um tipo novo é só mais
um caso — não uma segunda conexão.

**O push acontece depois de gravar no Cassandra.** Ele é otimização de latência, nunca a fonte
da verdade: quem não estiver conectado vê na próxima leitura do inbox.

Para escalar a N instâncias (fora do MVP), o desenho já comporta: dois `@KafkaListener`, um com
`groupId` fixo que grava uma única vez, e outro com `groupId` único por instância, fazendo toda
instância ver todo evento e empurrar só para suas sessões locais. Sem Redis pub/sub, sem sticky
session — e é exatamente o mecanismo que o chat vai precisar.

---

## Frontend

Respeitando a regra de dependência `api/ → services/ → hooks/ → components/`:

| Camada | Arquivo | O quê |
|---|---|---|
| `types/` | `notification.types.ts` | contrato + a frase de cada tipo (`notificationText`) |
| `api/` | `endpoints.ts` (editado) | bloco `notifications` — nenhuma rota literal fora daqui |
| `services/` | `notification.service.ts` | chamadas tipadas, sem React |
| `lib/` | `query-client.ts` (editado) | `queryKeys.notifications` |
| `lib/` | `realtime-socket.ts` | conexão, ticket, backoff, reconexão — sem React |
| `hooks/` | `use-notifications.ts` | `useInfiniteQuery` com cursor + mutations |
| `hooks/` | `use-realtime.ts` | monta o socket, roteia por `type`, injeta no cache |
| `components/notifications/` | `notification-bell/-panel/-item.tsx` | sino, popover, linha |
| `layout/` | `page-topbar.tsx` (editado) | onde o sino entra |

Detalhes que decidem a qualidade:

- **O sino entra na `PageTopbar`, não em cada página** — vale para o app inteiro, e nenhuma tela
  precisa saber que ele existe. Já **`use-realtime` é montado uma vez, no `AppLayout`**: duas
  montagens seriam duas conexões, e cada notificação chegaria duplicada. Ele desmonta no
  `AUTH_LOGOUT_EVENT`, que já existia em `lib/token-storage.ts`.
- **Ao chegar o frame, `setQueryData` faz prepend na primeira página e incrementa o contador** —
  sem refetch, porque a notificação já veio inteira. Refetch só no `onReconnect`, como rede de
  segurança para o que se perdeu durante a queda.
- **Cada tentativa de reconexão pede um ticket novo**, porque o anterior é de uso único e já foi
  queimado no handshake que caiu. Backoff de 1 s a 30 s, para o serviço não levar uma enxurrada
  justo quando acabou de voltar.
- **O polling do contador caiu de 30 s para 5 min** quando o push entrou: virou rede de
  segurança, não o caminho principal.
- **Erro na query do contador não mostra badge nem toast.** Se o `planix-realtime` cair, o sino
  simplesmente não acende e o resto do Planix segue inteiro — um contador não vale uma tela
  quebrada. Os três estados obrigatórios estão no painel: `Skeleton`, mensagem de erro e `Empty`
  no vazio, que é o estado mais visto de uma central de notificações nova.

`VITE_REALTIME_URL` **só existe em dev**, pelo mesmo motivo de `VITE_API_URL`: em produção o
nginx roteia por caminho e o navegador continua na mesma origem.

---

## Infraestrutura

O `planix/compose.yaml` é o **dono** da rede `planix-net`; os outros dois a consomem como
`external`. Daí a ordem de subida ser obrigatória:

```bash
docker compose -f planix/compose.yaml --profile app up -d
docker compose -f planix-realtime/compose.yaml up -d
docker compose -f planix-frontend-2/compose.yaml up -d
```

O `planix-realtime` não sobe sozinho num ambiente limpo.

Dois blocos novos no `nginx.conf`, **antes** do `location /`:

- `/api/notifications` é prefixo mais específico que `/api/`, então o nginx o escolhe sem
  ambiguidade — o resto de `/api/` continua indo para o `planix`.
- `/ws/` leva `proxy_read_timeout 3600s`. O default de 60 s derruba a conexão ociosa, e o
  sintoma parece bug de reconexão do frontend — não do proxy.

`PLANIX_JWT_SECRET` é o **mesmo** nos dois serviços: o `planix-realtime` valida o mesmo HS256 e
nunca chama de volta o Planix. Se os valores divergirem, o inbox responde 401 para todo mundo e
o sintoma não aponta para a causa. É dívida anotada; a saída seria RS256 + JWKS.

**Custo de memória, medido com o stack inteiro no ar:** Cassandra 1,73 GiB · `planix-app` 704 MiB
· Kafka 560 MiB · `realtime` 487 MiB · Postgres 71 MiB · nginx 14 MiB. São ~3,5 GB dos 15,3 GiB
que o WSL disponibiliza nesta máquina — cabe folgado, e memória não é um risco deste projeto.

---

## Diário de bordo: o que quebrou

Esta é a seção que nenhum tutorial tem. Todos os itens aconteceram nesta implementação.

**1. `@Backoff` mudou de casa no Spring Kafka 4.1.** *Sintoma:* `package
org.springframework.retry.annotation does not exist`. O `@Backoff` do spring-retry virou
`@BackOff` do **próprio Spring Kafka**, e o atributo do `@RetryableTopic` passou a ser `backOff`.
Descoberto com `javap` sobre o jar — mais rápido que caçar changelog.

**2. `@RetryableTopic` exige um `TaskScheduler`.** *Sintoma:* o contexto nem sobe — *"Either a
RetryTopicSchedulerWrapper or TaskScheduler bean is required"*. O backoff entre tentativas é
**agendado**, não é `sleep`. Resolvido com um `RetryTopicSchedulerWrapper` em
`config/KafkaConfig`.

**3. `LazyInitializationException` no `NotificationPublisherIT`.** *Sintoma:* `Could not
initialize proxy [User#3] - no session`. **O teste estava errado, não o código:** ele chamava o
publisher fora de uma transação e os proxies lazy não inicializavam. Em produção o publisher é
sempre chamado de dentro do `@Transactional` de um service — que é justamente o desenho. Vale
registrar porque a tentação era mudar o *código* para funcionar fora de transação, e isso
destruiria a propriedade que a outbox compra.

**4. Testes de notificação enxergando lixo dos vizinhos.** Verde isoladamente, vermelho na suíte:
os outros 135 ITs comitam de verdade e enchem a outbox. Corrigido com `deleteAll()` no
`@BeforeEach` de um teste **transacional** — o rollback desfaz tudo, e o isolamento não suja
ninguém. Na mesma linha, `assign` passou a notificar e quebrou dois testes que o usavam como
preparação: o teste acompanhou a realidade nova, não é workaround.

**5. O agendador de fundo contaminando um mock.** *Sintoma:* `TooManyActualInvocations: Wanted 1
time, but was 43 times`. O `OutboxRelay` agendado disparava na subida do contexto e drenava
linhas comitadas por **outros** ITs, todas passando pelo mesmo `KafkaTemplate` mockado. Correção:
`@EnableScheduling` virou condicional por propriedade e a suíte roda **sem agendador**, com os
ITs chamando `drenar()` e `varrer()` na mão. Banco compartilhado e tarefa de fundo não convivem
com asserções determinísticas.

**6. O cursor multi-coluna do Cassandra.** `(occurred_at, event_id) < (?, ?)` é recusado quando as
colunas de clustering têm direções diferentes — daí `DESC` nas duas, divergindo da spec.
Detectado ao desenhar o schema, antes de custar tempo de depuração.

**7. Miscelânea de ambiente.** Custaram pouco cada uma, mas somam:

- classes de teste mudaram de pacote no Boot 4: `@JsonTest` está em
  `org.springframework.boot.test.autoconfigure.json` e `@LocalServerPort` em
  `org.springframework.boot.test.web.server`;
- `planix-realtime` não era um repositório git — o Initializr gera o código, não o `.git`. Foi
  feito `git init` com o esqueleto como commit base;
- Git Bash estragando acentos em heredoc (`"Revisão"` virava 400 num teste de linha de comando) e
  convertendo caminhos absolutos em `docker compose exec` — resolvido com `MSYS_NO_PATHCONV=1`;
- um commit foi parar na `main` do frontend e precisou ser movido para a branch de feature.

---

## Como verificar tudo de novo

### Os três portões

| Repositório | Comando | Resultado |
|---|---|---|
| `planix` | `./mvnw clean verify` | **41** Surefire / **168** Failsafe, 0 falhas (a base era 38/135) |
| `planix-realtime` | `./mvnw clean verify` | **13** Surefire / **26** Failsafe, 0 falhas |
| `planix-frontend-2` | `npm run typecheck && npm run lint` | 0 erros, 3 avisos conhecidos |

Os `*IT` do `planix-realtime` sobem Cassandra **e** Kafka em Testcontainers; a Cassandra leva
~60 s para ficar pronta, e não é lentidão da máquina.

### O roteiro manual que foi executado

**O evento chega no tópico com a chave certa** — `kafka-console-consumer.sh --from-beginning
--property print.key=true` mostrou `board:3` para `CARD_MOVED` e `team:6` para
`TEAM_MEMBER_JOINED`; o fallback funciona e nada foi para round-robin.

**O inbox chega em quem deve.** Ana move um card → Bruno recebe, Ana não. Bruno entra na equipe
→ Ana recebe, Bruno não.

**O WebSocket sobe pelo nginx.** `POST /api/notifications/ws-ticket` pela porta 5173, e o
handshake responde `101 Switching Protocols`.

**Marcar como lida:** 204, contador 1 → 0, `read: true` na lista, e **404** ao tentar marcar a
notificação de outro usuário.

**Resiliência.** Com o `realtime` parado, registrar e criar quadro seguem 200 e o contador dá
502 — o sino some, a tela não quebra. Com o **Kafka** parado, aceitar convite responde 200, a
linha fica pendente na outbox e o relay loga o aviso; ao subir o Kafka de volta, a fila drena
sozinha.

### O que não foi verificado

Os **dois navegadores lado a lado**, vendo o sino acender na hora. Cada elo foi provado
isoladamente — o handshake pelo nginx, e um teste de integração que publica no Kafka e afirma
que o frame chega no socket com `NOTIFICATION_CREATED` e o payload correto — mas a confirmação
visual do contador subindo sem recarregar continua em aberto. É o único item do §12 da spec que
ficou.

---

## O que ficou fora do MVP

Herdado da spec, e registrado como evolução: menções `@fulano`, convite dirigido, preferências
por usuário (silenciar quadro, desligar tipo), agrupamento ("Fulano moveu 3 cards"), e-mail e
push, e escala para N instâncias.

E o **chat** — que é o motivo de o serviço se chamar `realtime` e não `notifications`, de o
frame já ter envelope tipado e de o `ConnectionHub` já ser genérico. Quando ele entrar, nada
disto aqui precisa mudar.
