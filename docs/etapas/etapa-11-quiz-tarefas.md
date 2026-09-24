# Etapa 11 — Tarefa como card de estudo (RN20)

**Branch:** `etapa-11-quiz-tarefas`

O backend adicionou a RN20: tarefas geradas pela IA agora vêm com uma questão de
múltipla escolha (`pergunta`/`opcoes`), e só concluem acertando. Também validou
os dois fluxos de IA com a OpenAI real (antes só tinha sido testado com a conta
sem crédito). Esta etapa adapta a tela de rotina para o novo contrato.

## O que mudou

### `src/types/index.ts`
- `Tarefa` ganha `pergunta: string | null` e `opcoes: string[]` (vazios/`null`
  em tarefas criadas manualmente).
- Novo `ConcluirTarefaInput` (`{ respostaSelecionada }`) e
  `TarefaConcluidaResposta` (`Tarefa & { correta?: boolean }`).
- Novo código de erro `RESPOSTA_OBRIGATORIA`.

### `src/app/(app)/rotinas/[id]/page.tsx` — `TarefaItem`
- Tarefa **sem** `pergunta` (criada manualmente): continua um clique direto no
  check, como antes.
- Tarefa **com** `pergunta` (da IA): em vez do check, mostra um ícone de
  interrogação; abaixo do título/descrição, a pergunta e as `opcoes` como
  botões. Clicar numa alternativa chama `PATCH .../concluir` com
  `{ respostaSelecionada: <índice> }`.
  - Resposta errada → `200 { correta: false }` — a alternativa fica marcada em
    vermelho, mensagem "não foi essa, tenta outra", **sem** bloquear novas
    tentativas (sem limite, sem penalidade — conforme o contrato).
  - Resposta certa → `200 { correta: true, concluida: true, xpConcedido: 10 }`
    → mesmo fluxo de sempre (refetch da rotina + `recarregarUsuario`).

### `CLAUDE.md`
Contrato de `PATCH /api/tarefas/:id/concluir` e a nota de RN20 atualizados.

## Verificação

- `npm run lint` / `npm run build` / `tsc --noEmit` — limpos.
- **e2e real de ponta a ponta, com a OpenAI de verdade** (não mais só o erro
  503): cadastro → `/chat` → uma mensagem com tema/nível/tempo/frequência → a
  IA já respondeu **`201` com a rotina pronta na primeira rodada** (4 tarefas,
  cada uma com resumo de estudo + pergunta de múltipla escolha em PT-BR,
  coerentes com o tema) → `/rotinas/:id` renderizando os 4 cards de estudo →
  cliquei alternativas erradas 3x (sempre `correta:false`, sem travar) → a 4ª
  acertou (`correta:true`) → tarefa concluída, **+10 XP**, progresso 0/4 → 1/4.
  Zero erros no console. Screenshots em `docs/screenshots/`.

## Situação

Com isso, o caminho feliz do chat (que ficava pendente desde a etapa 7 por
falta de crédito na OpenAI) está validado. Não há mais pendências conhecidas no
frontend em relação ao contrato atual do backend.
