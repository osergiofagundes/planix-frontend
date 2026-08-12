# Formulários

Todo formulário do projeto segue o mesmo desenho: React Hook Form para o estado,
Zod para as regras, e uma divisão clara de quem mostra qual erro.

Referências no código: `components/board/board-form-dialog.tsx` (dialog de
criar/editar) e `components/auth/login-form.tsx` (formulário de página).

## Os dois erros de um formulário

É a parte que dá errado quando alguém improvisa. São duas origens diferentes:

| Origem | Onde aparece | Como |
|---|---|---|
| Zod, antes de enviar | embaixo do campo | `<FieldError errors={[errors.name]} />` |
| Backend, por campo (`fieldErrors`) | embaixo do campo | `applyApiFieldErrors` |
| Backend, geral (409, 500, rede) | alerta no topo do form | `<FormErrorAlert />` |

E uma regra que fecha o desenho: **mutation de formulário não dá toast de erro.**
Toast é para ação sem formulário. Aqui a mensagem tem que ficar perto do campo
que a causou. Por isso `useCreateBoard` e `useLogin` não têm `onError` — quem
trata é o formulário.

## O esqueleto

```tsx
const BOARD_FIELDS = ["name", "description", "icon"] as const

export function BoardFormDialog({ open, onOpenChange, board }: Props) {
  const isEditing = Boolean(board)
  const createBoard = useCreateBoard()
  const updateBoard = useUpdateBoard(board?.id ?? 0)
  const mutation = isEditing ? updateBoard : createBoard

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: { name: "", description: "", visibility: "TEAM" },
  })

  // Dialog não desmonta ao fechar: sem este reset, a próxima abertura mostraria
  // o que foi digitado da vez anterior — e o erro da tentativa anterior.
  useEffect(() => {
    if (open) {
      form.reset({
        name: board?.name ?? "",
        description: board?.description ?? "",
        visibility: board?.visibility ?? "TEAM",
      })
      mutation.reset()
    }
  }, [open, board])

  const errors = form.formState.errors
  const apiError = mutation.error ? normalizeApiError(mutation.error) : null

  // Se o backend apontou os campos, eles já estão marcados no formulário.
  // Repetir a mesma coisa num alerta em cima seria redundante.
  const alertError = apiError && !hasFieldErrors(apiError) ? apiError : null

  function onSubmit(values: BoardFormValues) {
    mutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
      onError: (error) => {
        applyApiFieldErrors(normalizeApiError(error), form.setError, BOARD_FIELDS)
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormErrorAlert error={alertError} title="Não foi possível salvar o quadro" />

        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="board-name" required>Nome do quadro</FieldLabel>
          <Input
            id="board-name"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}
                     disabled={mutation.isPending}>
          Cancelar
        </DialogClose>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Spinner data-icon="inline-start" />}
          {mutation.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
```

## Os detalhes que importam

**`noValidate` no `<form>`.** Desliga a validação nativa do navegador, que
apareceria em inglês e com outro visual. Quem valida é o Zod.

**`applyApiFieldErrors` recebe a lista de campos conhecidos.** Ela ignora
qualquer `fieldError` que não esteja na lista — sem isso, um campo novo no
backend viraria um erro invisível, preso num campo que não existe na tela. E o
retorno diz se algum erro foi aplicado, caso você precise decidir algo a partir
disso.

**`reset()` no `open`, não no `close`.** Resetar ao fechar faz o conteúdo sumir
durante a animação de saída.

**`mutation.reset()` junto.** Sem ele, o erro da tentativa anterior continua em
`mutation.error` e o alerta reaparece assim que o dialog abre.

**Um campo controlado precisa de `Controller`.** `form.register` só funciona em
input nativo. Componentes como `BoardIconPicker` ou `BoardVisibilityField` vão
assim:

```tsx
<Controller
  control={form.control}
  name="icon"
  render={({ field }) => (
    <BoardIconPicker value={field.value} onChange={field.onChange} />
  )}
/>
```

**Acessibilidade não é opcional:** `htmlFor` no label apontando para o `id` do
input, `aria-invalid` no input, `data-invalid` no `Field` (é o que pinta a borda
de erro) e `required` no `FieldLabel` para o asterisco.

**Contador de caracteres** ocupa o lugar da descrição, não o do erro:

```tsx
{errors.description
  ? <FieldError errors={[errors.description]} />
  : <FieldDescription>{description.length} / {BOARD_DESCRIPTION_MAX}</FieldDescription>}
```

Use `useWatch` para ler o valor sem re-renderizar o formulário inteiro.

**Botão de envio** fica `disabled` enquanto `mutation.isPending`, mostra
`<Spinner data-icon="inline-start" />` e troca o texto para o gerúndio
("Salvando…"). O botão de cancelar também é desabilitado.

## Máscaras

Telefone e CEP usam os helpers de `lib/masks.ts` (`maskPhone`, `maskZipCode`,
`onlyDigits`). Aplique a máscara no `onChange` do campo e mande **só os dígitos**
para a API — formatação é assunto da tela, não do contrato.

## Um formulário novo, em ordem

1. schema em `schemas/<domínio>.schema.ts`, com `z.infer` para o tipo dos valores
2. hook de mutation em `hooks/`, **sem** `onError` de toast
3. componente com o esqueleto acima
4. a constante `<DOMINIO>_FIELDS` com os campos que o backend pode apontar
5. teste no navegador os três caminhos: campo inválido, erro do backend por campo
   (nome duplicado, por exemplo) e erro geral (desligue o backend e envie)
