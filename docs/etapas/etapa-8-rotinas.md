# Etapa 8 — Rotinas: lista, detalhe e CRUD de tarefas

**Branch:** `etapa-8-rotinas`

## O que foi entregue

### `src/app/(app)/rotinas/page.tsx` — lista
`GET /api/rotinas` → cards (tema, descrição, `_count.tarefas`, barra de
progresso). Estado vazio com CTA para `/chat`. Loading / `ErrorRetry`.

### `src/app/(app)/rotinas/[id]/page.tsx` — detalhe + CRUD
`GET /api/rotinas/:id`. Cabeçalho com tema, descrição, chips
(nível / tempo / frequência) e progresso (`concluídas/total`).

| Ação | Endpoint | Notas |
|---|---|---|
| Concluir tarefa | `PATCH /api/tarefas/:id/concluir` | spinner no check; depois recarrega a rotina (progresso) **e** `recarregarUsuario()` (XP/streak) |
| Adicionar tarefa | `POST /api/rotinas/:id/tarefas` | form inline no fim da lista |
| Editar tarefa | `PUT /api/tarefas/:id` | vira form inline no lugar do item |
| Remover tarefa | `DELETE /api/tarefas/:id` | `ConfirmDialog`; trata `ROTINA_SEM_TAREFA` (bloqueia a última) |
| Editar rotina | `PUT /api/rotinas/:id` | `Modal` com os 5 campos; `tema` obrigatório |
| **Excluir rotina** | `DELETE /api/rotinas/:id` | **`ConfirmDialog` obrigatório (RN06)** → redireciona para `/rotinas` |

`404 ROTINA_NAO_ENCONTRADA` / `403 ROTINA_ACESSO_NEGADO` → tela dedicada
"não encontrada" com link de volta.

Para não piscar "carregando" a cada ação, o detalhe usa um `override` local
(`override ?? query.data`) atualizado por um refetch silencioso após cada mutação.

### Primitivos novos — `src/components/ui/`
- `Modal` (portal, backdrop, Esc, trava o scroll; sobe de baixo no mobile)
- `ConfirmDialog` (Modal + Cancelar/Confirmar, variante `danger`)

## Verificação

- `npm run lint` / `npm run build` / `tsc --noEmit` — limpos.
- **e2e real** (Chrome + Firebase + backend + rotina de exemplo inserida no
  banco): lista vazia, lista com rotina, detalhe, **concluir tarefa → progresso
  0/3 → 1/3 e "+10 XP"**, 404 de rotina inexistente, abrir "adicionar tarefa".
  Screenshots em `docs/screenshots/`.
- Editar/excluir rotina e editar/remover tarefa: cobertos pelo mesmo contrato,
  ainda não exercitados clicando (o e2e cobriu leitura + concluir + adicionar).

## Pendências
- Criar rotina de verdade depende de crédito na OpenAI do backend (via `/chat`).
- Telas restantes: `/progresso`, `/ranking`, `/perfil`.
