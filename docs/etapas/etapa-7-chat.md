# Etapa 7 — Chat com IA (criação de rotina)

**Branch:** `etapa-7-chat`

Tela `/chat` — o usuário conversa com a IA e ela monta (e já salva) uma rotina.

## O que foi entregue

### `src/app/(app)/chat/page.tsx`
- Envia `POST /api/rotinas/chat` com **toda a conversa** a cada requisição
  (`{ mensagens: [{ role, content }] }`) — o backend não guarda histórico.
- **`200 { tipo: "pergunta" }`** → adiciona a pergunta da IA como bolha e segue a
  conversa.
- **`201 { tipo: "rotina" }`** → a rotina **já está persistida**; mostra um card
  de resumo (tema, descrição, primeiras tarefas) com link para `/rotinas/:id` e
  botão "criar outra". O input some (conversa encerrada).
- **`429 LIMITE_IA_DIARIO`** (`ApiError.isRateLimited`) → aviso "limite de 10
  conversas por dia; reseta amanhã", input desabilitado.
- **`502/503`** (`ApiError.isIaUnavailable`) → mensagem amigável "a IA está
  demorando/indisponível, tente de novo" (RNF06) — a mensagem enviada volta para
  o input e sai do histórico, o usuário reenvia.
- Estado de "digitando" (3 pontinhos) enquanto espera (o backend tem timeout de
  30s na OpenAI).
- `chamadasRestantes` (vindo de toda resposta) exibido como `N/10 hoje`.
- Chips de sugestão quando a conversa está vazia; `Enter` envia, `Shift+Enter`
  quebra linha; textarea cresce até ~5 linhas; limite de 2000 chars.
- Altura fixa (`100dvh - 8rem` / `-5rem` no desktop) com área de mensagens
  rolável e input fixo embaixo.

## Verificação

- `npm run lint` / `npm run build` / `tsc --noEmit` — limpos.
- **e2e real** (Chrome + Firebase + backend em `:3000`): cadastro → `/chat` →
  enviar mensagem → estado "digitando" → **`503 IA_INDISPONIVEL`** (a conta
  OpenAI do backend está sem crédito) → mensagem amigável, texto devolvido ao
  input, sem travar. Screenshots desktop + mobile conferidos.
- **Caminho feliz (pergunta / rotina criada) não pôde ser testado** — depende de
  crédito na conta OpenAI do backend. O código trata os dois `tipo`s conforme o
  contrato (`referencia-api.md` / `integracao-openai.md`).

## Pendências
- `/rotinas` e `/rotinas/:id` (o card de rotina criada já linka para lá) — etapa 8.
- Revalidar o caminho feliz quando a OpenAI tiver crédito.
