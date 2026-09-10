# Etapa 10 — Perfil

**Branch:** `etapa-10-perfil`

Última tela do protótipo. Com ela, todas as telas de `(app)` estão feitas.

## `src/app/(app)/perfil/page.tsx`

Dados de `useAuth` (`firebaseUser` + `usuario`):

- **Cabeçalho**: avatar com iniciais, nome, e-mail, "Membro desde <mês/ano>"
  (`usuario.dataCriacao`).
- **Stats**: XP total e ofensiva (de `usuario`).
- **Dados da conta**:
  - **Nome** — editável inline (`atualizarNome` → `updateProfile` do Firebase +
    `getIdToken(true)`; **não há `PUT /me`**).
  - **E-mail** — só leitura ("definido pelo provedor de login").
  - **Entrar com** — `E-mail e senha` / `Google` (de
    `firebaseUser.providerData[0].providerId`).
- **Sessão** — botão "Sair da conta".
- **Zona de perigo** — "Excluir minha conta" → `ConfirmDialog` →
  `excluirConta()` (`DELETE /api/usuarios/me` → `signOut` → `/login`).

### `useAuth` / `lib/auth.ts`
Novos: `atualizarNome(nome)` e `excluirConta()`. `atualizarNome` ressincroniza
o `nomeFirebase` do contexto e recarrega o perfil.

## Verificação

- `npm run lint` / `npm run build` / `tsc --noEmit` — limpos.
- **e2e real** (Chrome + Firebase + backend):
  - cadastro → `/perfil` mostra nome, e-mail, "E-mail e senha", "Membro desde" ✅
  - **editar nome**: "Lucas Ferreira" → "Lucas F. Ferreira" ✅
  - **excluir conta**: confirmar → `DELETE /me` → `signOut` → redireciona para
    `/login`; usuário some do backend e do Firebase ✅
  - **zero erros no console**.
  - Screenshots em `docs/screenshots/`.

## Situação das telas

Todas as 10 telas do protótipo Figma estão implementadas: Login, Cadastro,
Recuperar senha, Dashboard, Chat IA, Rotinas (lista + detalhe), Progresso,
Ranking, Perfil.

Opcional (não estava no escopo obrigatório): landing pública em `/` — hoje `/`
redireciona para `/dashboard`.

## Pendência única
- Criar rotina de verdade pelo `/chat` depende de crédito na conta OpenAI do
  backend (o tratamento de erro já foi validado).
