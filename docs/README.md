# Documentação do Planix Frontend

Comece pelo [`CLAUDE.md`](../CLAUDE.md) na raiz: ele tem as regras que valem
sempre. Estes documentos são o detalhe.

| Documento | Abra quando… |
|---|---|
| [ARQUITETURA.md](ARQUITETURA.md) | quiser entender as camadas, o que cada pasta faz e por onde um dado passa da tela até a API |
| [NOVA-FEATURE.md](NOVA-FEATURE.md) | for implementar qualquer coisa nova — é a receita passo a passo, camada por camada |
| [CONVENCOES.md](CONVENCOES.md) | precisar nomear um arquivo, um export ou organizar imports |
| [CAMADA-API.md](CAMADA-API.md) | for mexer em HTTP, refresh de token, tratamento de erro ou cache do TanStack Query |
| [FORMULARIOS.md](FORMULARIOS.md) | for criar ou alterar um formulário |
| [UI.md](UI.md) | for mexer em componente visual, tema, ícone, toast ou estado vazio |
| [SHADCN-UI.md](SHADCN-UI.md) | estiver procurando um componente do shadcn (catálogo oficial) |

Para subir o projeto (local, Docker, dev e produção), veja o
[README](../README.md).

## Como manter isto vivo

Estes documentos descrevem o padrão que o código **de fato** segue. Se você
mudar o padrão, mude o documento no mesmo commit. Documentação que descreve um
projeto que não existe mais é pior do que documentação nenhuma.
