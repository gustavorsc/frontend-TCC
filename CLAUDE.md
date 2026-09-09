# CLAUDE.md — Frontend

Este arquivo orienta o Claude Code no desenvolvimento do **frontend**. O backend vive em um repositório separado (`backend-TCC`) e já está implementado — o contrato de API abaixo é a fonte da verdade sobre o que ele expõe. Não invente rotas, campos ou comportamentos que não estejam aqui.

## Sobre o projeto

Interface web de uma aplicação de gerenciamento de rotinas de estudo com IA e gamificação. Usuário único (sem papel de professor/aluno, modelo tipo Duolingo). O visual e o fluxo de telas já foram prototipados no Figma — use o protótipo como referência de UI, não redesenhe do zero.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Firebase Client SDK (autenticação)
- Fetch/axios para consumir a API REST do backend

## Estrutura de pastas

```
frontend/
├── CLAUDE.md
├── src/
│   ├── app/                # rotas (App Router)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── cadastro/
│   │   │   └── recuperar-senha/
│   │   ├── (app)/           # rotas autenticadas
│   │   │   ├── dashboard/
│   │   │   ├── rotinas/
│   │   │   ├── chat/
│   │   │   ├── progresso/
│   │   │   └── perfil/
│   │   └── layout.tsx
│   ├── components/          # componentes reutilizáveis (ex.: ui/ para os primitivos)
│   ├── lib/
│   │   ├── firebase.ts       # inicialização do Firebase Client SDK
│   │   └── api.ts            # cliente HTTP centralizado (injeta o Bearer token)
│   ├── hooks/                # ex.: useAuth, useRotinas
│   └── types/                # tipos espelhando os DTOs da API
└── package.json
```

## Autenticação (fluxo do frontend)

O frontend fala com o Firebase para login/cadastro; o backend só verifica o token, não gerencia sessão.

1. Cadastro: `createUserWithEmailAndPassword` (Firebase) ou `signInWithPopup` com `GoogleAuthProvider`. Não há passo de "objetivo/foco" — o backend não guarda esse campo (nível, tempo e frequência são informados no chat, por rotina).
2. Login: `signInWithEmailAndPassword` ou Google.
3. Após autenticar, obter o ID Token (`user.getIdToken()`) e enviar em **todas** as chamadas à API no header `Authorization: Bearer <token>`.
4. No primeiro login, chamar `GET /api/usuarios/me` — o backend cria o `Usuario` automaticamente se não existir; não é preciso um endpoint de "registro" separado.
5. Recuperação de senha: `sendPasswordResetEmail` do Firebase, direto do frontend — **não** passa pelo backend.
6. Token expirado/inválido → a API responde `401` com `code: "NAO_AUTENTICADO"`. O cliente HTTP (`lib/api.ts`) tenta uma vez renovar o token (`getIdToken(true)`) e refazer a chamada; se ainda vier `401`, redireciona para `/login`.
7. Não existe `PUT /api/usuarios/me` — `nome`/`email` vêm do Firebase. "Editar perfil" no frontend é `updateProfile` do Firebase (só `displayName`); e-mail não muda.
8. `DELETE /api/usuarios/me` responde `204`; **em seguida o frontend faz `signOut` no Firebase**.

## Contrato da API (backend já implementado)

Base URL vem de `NEXT_PUBLIC_API_URL`. Em desenvolvimento o backend roda em `http://localhost:3000`, então o frontend sobe em **`:3001`** (`npm run dev`/`start` já usam `-p 3001`) e o backend precisa de `FRONTEND_URL=http://localhost:3001` no `.env` dele (CORS). Todas as rotas abaixo exigem o header `Authorization`, exceto `/health`.

**Contrato campo a campo (fonte de verdade):** `../backend-TCC/docs/referencia-api.md` e `../backend-TCC/docs/modelo-de-dados.md`. Os tipos em `src/types/index.ts` espelham esses documentos. Datas são strings ISO 8601 UTC.

| Método | Rota | Retorno / notas |
|---|---|---|
| GET | `/api/usuarios/me` | `{ id, nome, email, xpTotal, streakAtual, ultimaAtividade, dataCriacao }` |
| DELETE | `/api/usuarios/me` | `204` — depois fazer `signOut` no Firebase |
| GET | `/api/usuarios/me/progresso` | `{ xpTotal, streakAtual, streakEmRisco, rotinas: [{ id, tema, progresso }] }` (RN16) |
| GET | `/api/ranking` | `[{ usuarioId, nome, xpSemana }]` — semana atual, desc; quem não pontuou não aparece |
| POST | `/api/rotinas/chat` | envia `{ mensagens: [{ role: "user"\|"assistant", content }] }` (1–40, `content` 1–2000, última = `user`). Resposta `200 { tipo: "pergunta", mensagem, chamadasRestantes }` ou `201 { tipo: "rotina", rotina, chamadasRestantes }` — a rotina **já está salva**, sem passo de confirmação |
| GET | `/api/rotinas` | `Rotina[]` com `_count.tarefas` (sem o array de tarefas) |
| GET | `/api/rotinas/:id` | `Rotina` + `tarefas: Tarefa[]` |
| PUT | `/api/rotinas/:id` | edita `tema, descricao, nivelConhecimento, tempoDisponivel, frequencia` (≥1 campo; `progresso`/`tarefas` não são aceitos) |
| DELETE | `/api/rotinas/:id` | `204` — **frontend exige confirmação antes de chamar** (RN06 é responsabilidade da UI) |
| POST | `/api/rotinas/:id/tarefas` | body `{ titulo, descricao? }` → `201` com a `Tarefa` |
| PUT | `/api/tarefas/:id` | edita `titulo, descricao` (≥1 campo) |
| DELETE | `/api/tarefas/:id` | `204` — recusa remover a **última** tarefa da rotina (`400 ROTINA_SEM_TAREFA`) |
| PATCH | `/api/tarefas/:id/concluir` | sem body → `200` com a `Tarefa` (`concluida: true`, `xpConcedido: 10`). Idempotente. Depois, recarregar `useAuth` (XP/streak mudaram) |
| GET | `/api/desafios` | `Desafio[]` — `conteudo` é texto da IA (1ª linha = título) |
| PATCH | `/api/desafios/:id/concluir` | sem body → `200` com o `Desafio`. Idempotente |

**Erros:** toda resposta de erro vem no formato `{ error: { message, code } }`. Tratar de forma centralizada no cliente HTTP (`lib/api.ts`), não em cada componente. `code` é um dos: `VALIDACAO`, `ROTINA_SEM_TAREFA`, `NAO_AUTENTICADO`, `*_ACESSO_NEGADO(A)`, `*_NAO_ENCONTRADO(A)`, `LIMITE_IA_DIARIO`, `IA_RESPOSTA_INVALIDA`, `IA_INDISPONIVEL`, `ERRO_INTERNO` (ver `ApiErrorCode` em `types/`).

**Limite de IA (RN15):** toda resposta do chat traz `chamadasRestantes` (limite 10/dia, reseta na virada do dia em São Paulo). Ao esgotar, `POST /api/rotinas/chat` responde `429 LIMITE_IA_DIARIO` — mostrar mensagem clara na tela de chat, não erro genérico. `ApiError.isRateLimited` cobre esse caso; `ApiError.isIaUnavailable` cobre `502/503` (`IA_INDISPONIVEL`/`IA_RESPOSTA_INVALIDA`).

## Telas previstas (protótipo Figma)

Login, Cadastro, Recuperação de senha, Dashboard, Chat com IA (criação de rotina), Lista de rotinas, Detalhe da rotina, Progresso/gamificação, Ranking, Perfil. Use o protótipo como fonte de verdade para layout, cores e componentes — o `CLAUDE.md` não substitui o design, só o contrato de dados por trás dele.

Onde o protótipo pede dados que o backend não tem, **omitir o campo** (não inventar rota): não há "apelido público" (o ranking usa `nome` do Firebase), nem "foco/objetivo de estudo" no perfil, nem histórico de atividades do usuário. "Exercícios/questões" do protótipo correspondem aos **desafios adaptativos** (`/api/desafios`), que são texto gerado pela IA — não um quiz de múltipla escolha.

## Requisitos não funcionais relevantes ao frontend

- **RNF03 (Responsividade):** mobile-first com Tailwind, testar em pelo menos 3 breakpoints (360px, 768px, 1280px).
- **RNF04 (Usabilidade):** ações principais (concluir tarefa, ver progresso) em poucos cliques.
- **RNF06:** o chat com IA pode demorar ou falhar (erro 503/502 do backend) — sempre mostrar estado de carregamento e mensagem de erro amigável, nunca deixar a tela travada sem feedback.

## Convenções de código

- Componentização, tipagem forte (evitar `any`)
- Tipos em `types/` espelhando exatamente os campos que a API retorna — não inventar campos que a API não envia
- Estado do usuário autenticado num contexto/hook único (`useAuth`), não replicado em cada página
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`

## Variáveis de ambiente (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Copiar de `.env.local.example`. O frontend serve em `:3001` (o backend ocupa `:3000`).

## O que NUNCA fazer sem perguntar antes

- Criar uma rota de API nova ou mudar o formato de uma existente — o contrato é do backend, qualquer mudança precisa ser combinada nos dois repositórios.
- Implementar lógica de negócio no frontend (cálculo de XP, streak, ranking) — isso é do backend; o frontend só exibe o que a API retorna.
- Pular a tela de confirmação antes de `DELETE /api/rotinas/:id` (RN06).
- Redesenhar telas do zero sem consultar o protótipo Figma já aprovado.
