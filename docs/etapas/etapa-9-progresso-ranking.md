# Etapa 9 — Progresso e Ranking

**Branch:** `etapa-9-progresso-ranking`

## `src/app/(app)/progresso/page.tsx`

`GET /api/usuarios/me/progresso` + `GET /api/desafios`:

- Cards de XP total e ofensiva; aviso de **streak em risco** (RN16).
- **Progresso por rotina**: barra por rotina (`progresso.rotinas`), link para
  `/rotinas/:id`.
- **Desafios**: cada `Desafio` — 1ª linha do `conteudo` é o título, o resto é o
  corpo (passos da IA). Botão **"Marcar como concluído"**
  (`PATCH /api/desafios/:id/concluir`, idempotente) → refetch.

## `src/app/(app)/ranking/page.tsx`

`GET /api/ranking` → `[{ usuarioId, nome, xpSemana }]` (desc, semana corrente):

- Medalha para o top 3, número para o resto.
- Linha do usuário atual destacada (compara `usuarioId` com `usuario.id` do
  `useAuth`) e marcada "você".
- Estado vazio ("ninguém pontuou ainda"); aviso quando o usuário não está na
  lista.

## Verificação

- `npm run lint` / `npm run build` / `tsc --noEmit` — limpos.
- **e2e real** (Chrome + Firebase + backend + dados semeados no banco: 2 usuários,
  rotinas com tarefas concluídas na semana, 1 desafio):
  - `/progresso`: XP 30, ofensiva 3 dias, 2 rotinas (100% / 40%), card do desafio
    com o texto completo → **concluir desafio → "Concluído"** ✅
  - `/ranking`: Carlos Mendes 60 XP (1º), Beatriz Lima 30 XP com destaque "você"
    (2º) ✅
  - Screenshots em `docs/screenshots/`.

## Pendências
- Falta só `/perfil` (etapa 10): editar `displayName` no Firebase + excluir conta
  (`DELETE /api/usuarios/me` + `signOut`).
- Criar rotina de verdade continua dependendo de crédito na OpenAI.
