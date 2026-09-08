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

1. Cadastro: `createUserWithEmailAndPassword` (Firebase) ou `signInWithPopup` com `GoogleAuthProvider`.
2. Login: `signInWithEmailAndPassword` ou Google.
3. Após autenticar, obter o ID Token (`user.getIdToken()`) e enviar em **todas** as chamadas à API no header `Authorization: Bearer <token>`.
4. No primeiro login, chamar `GET /api/usuarios/me` — o backend cria o `Usuario` automaticamente se não existir; não é preciso um endpoint de "registro" separado.
5. Recuperação de senha: `sendPasswordResetEmail` do Firebase, direto do frontend — **não** passa pelo backend.
6. Token expirado/inválido → a API responde `401`; nesse caso, redirecionar para `/login`.

## Contrato da API (backend já implementado)

Base URL vem de `NEXT_PUBLIC_API_URL`. Todas as rotas abaixo exigem o header `Authorization`, exceto `/health`.

| Método | Rota | Uso na tela |
|---|---|---|
| GET | `/api/usuarios/me` | Perfil do usuário (nome, XP, streak) |
| DELETE | `/api/usuarios/me` | Excluir conta |
| GET | `/api/usuarios/me/progresso` | Tela de progresso: XP, streak, `streakEmRisco` |
| GET | `/api/ranking` | Tela de ranking semanal |
| POST | `/api/rotinas/chat` | Tela de chat — envia `{ mensagens: [...] }`, recebe `{ tipo: "pergunta" \| "rotina", ... }` |
| GET | `/api/rotinas` | Lista de rotinas |
| GET | `/api/rotinas/:id` | Detalhe da rotina com tarefas |
| PUT | `/api/rotinas/:id` | Editar rotina |
| DELETE | `/api/rotinas/:id` | Excluir rotina — **frontend exige confirmação antes de chamar** (RN06 é responsabilidade da UI) |
| POST | `/api/rotinas/:id/tarefas` | Adicionar tarefa |
| PUT | `/api/tarefas/:id` | Editar tarefa |
| DELETE | `/api/tarefas/:id` | Remover tarefa |
| PATCH | `/api/tarefas/:id/concluir` | Marcar tarefa como concluída |
| GET | `/api/desafios` | Lista de desafios adaptativos |
| PATCH | `/api/desafios/:id/concluir` | Concluir desafio |

**Erros:** toda resposta de erro vem no formato `{ error: { message, code } }`. Tratar de forma centralizada no cliente HTTP (`lib/api.ts`), não em cada componente.

**Limite de IA (RN15):** `POST /api/rotinas/chat` pode responder `429` quando o usuário atinge o limite diário de chamadas — tratar com uma mensagem clara na tela de chat, não como erro genérico.

## Telas previstas (protótipo Figma)

Login, Cadastro, Recuperação de senha, Dashboard, Chat com IA (criação de rotina), Lista de rotinas, Detalhe da rotina, Progresso/gamificação, Ranking, Perfil. Use o protótipo como fonte de verdade para layout, cores e componentes — o `CLAUDE.md` não substitui o design, só o contrato de dados por trás dele.

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
NEXT_PUBLIC_API_URL=
```

## O que NUNCA fazer sem perguntar antes

- Criar uma rota de API nova ou mudar o formato de uma existente — o contrato é do backend, qualquer mudança precisa ser combinada nos dois repositórios.
- Implementar lógica de negócio no frontend (cálculo de XP, streak, ranking) — isso é do backend; o frontend só exibe o que a API retorna.
- Pular a tela de confirmação antes de `DELETE /api/rotinas/:id` (RN06).
- Redesenhar telas do zero sem consultar o protótipo Figma já aprovado.
