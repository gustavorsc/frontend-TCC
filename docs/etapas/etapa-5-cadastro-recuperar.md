# Etapa 5 — Telas de cadastro e recuperação de senha

**Branch:** `etapa-5-cadastro-recuperar` (stack sobre `etapa-4-alinhar-contrato-api`)

Fecha o grupo `(auth)`. Os links "Cadastre-se" e "Esqueceu a senha?" no login
já existiam e davam 404.

## O que foi entregue

### `src/app/(auth)/cadastro/page.tsx`
- Campos: nome, e-mail, senha (mín. 6 — validado no cliente antes de chamar o
  Firebase; `weak-password` também é tratado no retorno).
- `useAuth().cadastrarComEmail(email, senha, nome)` + `entrarComGoogle()`.
- Loading por ação (`email` / `google`), erros PT-BR via `Alert` (`AuthError`).
- Sucesso → `router.replace("/dashboard")`.
- **Sem o passo "objetivo"** do protótipo Figma — o backend não guarda esse
  campo (nível/tempo/frequência vêm do chat, por rotina).

### `src/app/(auth)/recuperar-senha/page.tsx`
- Campo único: e-mail → `useAuth().recuperarSenha(email)`
  (`sendPasswordResetEmail` do Firebase, não passa pelo backend).
- **Não revela se a conta existe:** `auth/user-not-found` cai no mesmo estado de
  sucesso. Só `invalid-email` / `too-many-requests` / falha de rede viram erro.
- Estado de sucesso substitui o formulário por um `Alert` + botão "Voltar para o
  login".

Ambas reusam o layout `(auth)` (casca centralizada + `GuestGate`) e os
primitivos (`Card`, `TextField`, `Button`, `Alert`, `Logo`, `GoogleIcon`) — mesma
identidade da tela de login.

## Verificação
- `npm run lint` — limpo
- `npm run build` — passa; `/cadastro` e `/recuperar-senha` prerenderizados

## Nome de exibição

O backend define `Usuario.nome` a partir do token **no 1º acesso**, e o token
recém-criado no cadastro por e-mail ainda não tem o `displayName` que o
`updateProfile` acabou de gravar → o `nome` no backend nasce igual ao e-mail.

**Tratado no frontend:** `useAuth` passa a expor `nomeExibicao`
(`firebaseUser.displayName ?? usuario.nome ?? firebaseUser.email`). As telas usam
esse valor, não `usuario.nome` cru.

**Follow-up no backend** (`docs/backend-followups/nome-reconciliacao.md` no repo
do backend): o middleware de auth pode reconciliar `nome`/`email` a partir do
token quando divergirem — resolve o caso na origem e ainda cobre troca de nome no
provedor. Não bloqueia o frontend.

## Pendências conhecidas
- `/dashboard` (destino pós-cadastro/login) ainda não existe — Etapa 6.
