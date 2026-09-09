# Etapa 4 — Alinhar o frontend ao contrato real do backend

**Branch:** `etapa-4-alinhar-contrato-api`

O backend publicou a documentação completa da API (`backend-TCC/docs/`). Até aqui
os tipos do frontend eram inferidos (campos marcados `// ?`). Esta etapa troca
tudo pelo contrato real, antes de construir mais telas em cima de tipos errados.

## O que mudou

### `src/types/index.ts` — reescrito conforme `referencia-api.md` + `modelo-de-dados.md`
| Antes (inferido) | Agora (real) |
|---|---|
| `Usuario { nome, xp, streak }` | `{ id, nome, email, xpTotal, streakAtual, ultimaAtividade, dataCriacao }` |
| `Progresso { xp, streak, streakEmRisco }` | `{ xpTotal, streakAtual, streakEmRisco, rotinas: [{ id, tema, progresso }] }` |
| `RankingEntrada { posicao, nome, xp }` | `{ usuarioId, nome, xpSemana }` |
| `Rotina { id, titulo }` | `{ id, usuarioId, tema, descricao, nivelConhecimento, tempoDisponivel, frequencia, progresso, dataCriacao }` + `RotinaResumo` (com `_count.tarefas`) e `RotinaComTarefas` (com `tarefas[]`) |
| `Tarefa { id, titulo, concluida }` | `{ id, rotinaId, titulo, descricao, concluida, dataCriacao, dataConclusao, xpConcedido }` |
| `Desafio { id, titulo, concluido }` | `{ id, usuarioId, tema, conteudo, concluido, dataCriacao }` |
| `ChatMensagem { papel, conteudo }` | `{ role: "user"\|"assistant", content }` |
| `ChatResponse` genérico | `ChatRespostaPergunta` \| `ChatRespostaRotina` (com `mensagem`/`rotina` + `chamadasRestantes`) |

Novos: `AtualizarRotinaInput`, `CriarTarefaInput`, `AtualizarTarefaInput`,
`ApiErrorCode` (união dos 13 códigos de erro), `ProgressoRotina`.

### `src/lib/api.ts`
- **Retry em `401`:** o Firebase às vezes entrega um ID Token em cache já
  expirado. Agora, ao receber `401`, o cliente pede `getIdToken(true)` e refaz a
  requisição uma vez; só então dispara o `unauthorizedHandler` (→ `/login`).
- `ApiError.code` tipado como `ApiErrorCode`.
- `isRateLimited` (429 / `LIMITE_IA_DIARIO`) e novo `isIaUnavailable`
  (502/503 / `IA_INDISPONIVEL` / `IA_RESPOSTA_INVALIDA`) para a tela de chat.

### `src/hooks/useAuth.tsx`
`tokenProvider` repassa o `forceRefresh` para `firebaseUser.getIdToken(force)`.

### Porta / CORS
- Backend roda em `:3000` → frontend passa a servir em **`:3001`**
  (`package.json`: `next dev -p 3001` / `next start -p 3001`).
- `.env.local.example`: `NEXT_PUBLIC_API_URL=http://localhost:3000`.
- **Ação no backend:** setar `FRONTEND_URL=http://localhost:3001` no `.env` dele.

### `CLAUDE.md`
Tabela de contrato reescrita com os retornos reais, lista de `code`s de erro,
nota de porta/CORS, ausência de `PUT /me` e do passo "objetivo" no cadastro,
e o mapeamento telas-do-Figma → dados que o backend realmente tem.

## Verificação
- `npm run lint` — limpo
- `npm run build` — passa (`/` e `/login` prerenderizados)

## Impacto em código existente
Nenhuma tela consumia os campos antigos ainda (só `useAuth` guarda o `Usuario`
como opaco). Sem breaking change visível.

## Próxima etapa
Telas `/cadastro` e `/recuperar-senha` (fecham o grupo `(auth)`; os links já
existem no login e hoje dão 404). Cadastro = nome + e-mail + senha + Google,
**sem** o passo de "objetivo" do protótipo.
