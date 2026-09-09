# Etapa 6 — Layout autenticado + Dashboard

**Branch:** `etapa-6-dashboard` (stack sobre `etapa-5-cadastro-recuperar`)

Primeira tela ligada na API real.

## O que foi entregue

### Casca do app — `src/app/(app)/layout.tsx` + `src/components/app/NavBar.tsx`
- `AuthGate` protege todo o grupo `(app)` (sem sessão → `/login`).
- `NavBar`: sidebar fixa em `md+`, barra inferior fixa no mobile (RNF03).
  Itens: Início, Rotinas, Chat IA, Progresso, Ranking, Perfil + botão Sair
  (`useAuth().sair`). Estado ativo por `usePathname`.
- `main` centralizado, `max-w-5xl`, `pb-24` no mobile para não passar por baixo
  da barra.

### `src/hooks/useApi.ts` — `useApiQuery<T>(path)`
GET com `{ data, error, carregando, recarregar }` para telas de leitura.
Cancela respostas obsoletas (flag por efeito). Mutations continuam via `api()`.

### Primitivos novos — `src/components/ui/`
- `StatCard` (ícone + label + valor + hint).
- `ErrorRetry` (estado de erro com "Tentar de novo" — RNF06).
- `index.ts` agora exporta também `FullscreenLoader`.

### `src/app/(app)/dashboard/page.tsx`
Consome `GET /api/usuarios/me/progresso` e `GET /api/desafios`
(`nome` vem do `useAuth().nomeExibicao`):
- Saudação + aviso de **streak em risco** (RN16) quando `streakEmRisco`.
- 3 `StatCard`: XP total, ofensiva (dias), nº de rotinas.
- **Suas rotinas**: `progresso.rotinas` com `ProgressBar` por rotina, link para
  `/rotinas/:id`. Sem rotina → card de CTA para `/chat`.
- **Desafios**: desafios em aberto (`conteudo` → 1ª linha é o título). Erro nos
  desafios não derruba a tela (bloco isolado com retry).
- Loading full-screen enquanto o progresso não chega; erro → `ErrorRetry`.

### `src/app/page.tsx`
`/` agora redireciona para `/dashboard` (o `AuthGate` manda para `/login` se não
houver sessão). A landing pública fica para uma etapa futura.

## O que NÃO entrou (não existe no backend)
Nível, meta diária, gráfico de XP semanal, emblemas/recompensas, "cronograma de
hoje" — o protótipo Figma mostra, mas a API não expõe. Conforme o `CLAUDE.md`,
campo sem dado no backend é omitido.

## Verificação
- `npm run lint` — limpo
- `npm run build` — passa; `/dashboard` compila (render real precisa de sessão +
  backend em `:3000`)

## Pendências
- Rotas `/rotinas`, `/chat`, `/progresso`, `/ranking`, `/perfil` ainda dão 404
  (a `NavBar` já aponta para elas) — próximas etapas.
- Verificação visual nos 3 breakpoints pendente (precisa de `.env.local` + backend).
