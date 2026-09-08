# Etapa 2 — Camada de autenticação

**Branch:** `etapa-2-auth`

Fundação de autenticação, sem telas. As telas de `(auth)` (login, cadastro,
recuperar-senha) entram na Etapa 3.

## O que foi entregue

### `src/lib/auth.ts` (novo)
Wrappers do Firebase Client SDK com erros já traduzidos para PT-BR (`AuthError`):

| Função | Firebase |
|---|---|
| `cadastrarComEmail(email, senha, nome?)` | `createUserWithEmailAndPassword` + `updateProfile` |
| `entrarComEmail(email, senha)` | `signInWithEmailAndPassword` |
| `entrarComGoogle()` | `signInWithPopup(GoogleAuthProvider)` |
| `recuperarSenha(email)` | `sendPasswordResetEmail` (não passa pelo backend) |
| `sair()` | `signOut` |

### `src/hooks/useAuth.tsx` (novo)
`AuthProvider` + hook `useAuth` — contexto único do usuário autenticado
(CLAUDE.md). Expõe: `firebaseUser`, `usuario` (perfil do backend), `carregando`,
as ações de auth, `sair` e `recarregarUsuario`.

- Observa `onAuthStateChanged`.
- Registra `setTokenProvider` (→ `firebaseUser.getIdToken()`) e
  `setUnauthorizedHandler` (→ `router.replace("/login")`) no cliente HTTP.
- No login, chama `GET /api/usuarios/me` (o backend cria o `Usuario` se não
  existir — não há endpoint de registro separado).

### `src/lib/firebase.ts` (ajuste)
`getAuth` passou a ser lazy (`getFirebaseAuth()`): valida a API key na chamada e
quebraria o `next build`/prerender, que não tem as env `NEXT_PUBLIC_FIREBASE_*`.
Config incompleto agora loga erro no console do navegador em vez de lançar no
carregamento do módulo.

### `src/app/layout.tsx` (ajuste)
`<AuthProvider>` envolve a árvore.

## Verificação

- `npx eslint src` — limpo
- `npx next build` — passa (prerender de `/` OK sem env de Firebase)

## Pendências conhecidas

- `src/types/index.ts` ainda tem campos inferidos (`// ?`) — depende dos DTOs
  reais do backend.
- Guarda de rota do route group `(app)` — Etapa 3/4.
