# Rotinas de Estudo — Frontend

Interface web de uma aplicação de gerenciamento de rotinas de estudo com **IA** e
**gamificação** (usuário único, modelo tipo Duolingo). Projeto de TCC.

O backend vive em outro repositório (`backend-TCC`) e já está implementado — este
app só o consome. O contrato da API está em [`CLAUDE.md`](CLAUDE.md) e, campo a
campo, em `../backend-TCC/docs/referencia-api.md`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase Client SDK** — autenticação (e-mail/senha e Google)
- `fetch` via um cliente HTTP central ([`src/lib/api.ts`](src/lib/api.ts))

## Telas

Login · Cadastro · Recuperar senha · Dashboard · Chat com IA (criação de rotina) ·
Rotinas (lista + detalhe com CRUD de tarefas) · Progresso/gamificação · Ranking
semanal · Perfil.

Capturas em [`docs/screenshots/`](docs/screenshots/). Histórico de
desenvolvimento por etapa em [`docs/etapas/`](docs/etapas/).

## Rodando localmente

**Pré-requisitos:** Node 22+, o **backend rodando em `http://localhost:3000`**
(veja o repositório `backend-TCC`), e um projeto Firebase com os provedores
**E-mail/senha** e **Google** habilitados em *Authentication → Sign-in method*.

```bash
npm install
cp .env.local.example .env.local   # preencher (veja abaixo)
npm run dev                         # http://localhost:3001
```

> O frontend sobe na porta **3001** porque o backend ocupa a **3000**. No `.env`
> do backend, `FRONTEND_URL` precisa ser `http://localhost:3001` (CORS).

### Variáveis de ambiente (`.env.local`)

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Config **Web** do Firebase (pública). Console → Configurações do projeto → Seus apps → app Web → "Configuração do SDK" |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | id do projeto Firebase |
| `NEXT_PUBLIC_API_URL` | URL do backend — `http://localhost:3000` em dev |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3001) |
| `npm run build` | Build de produção (roda o type-check) |
| `npm run start` | Servir o build de produção (porta 3001) |
| `npm run lint` | ESLint |

## Estrutura

```
src/
├── app/
│   ├── (auth)/      login, cadastro, recuperar-senha  (guarda: só visitantes)
│   ├── (app)/       dashboard, rotinas, chat, progresso, ranking, perfil  (guarda: AuthGate)
│   └── layout.tsx   <AuthProvider>
├── components/
│   ├── ui/          primitivos (Button, Card, Modal, TextField, …)
│   ├── auth/        AuthGate / GuestGate
│   ├── app/         NavBar (casca autenticada)
│   └── brand/       Logo, GoogleIcon
├── hooks/
│   ├── useAuth      contexto único do usuário autenticado
│   └── useApi       useApiQuery — GET com loading/erro/retry
├── lib/
│   ├── firebase.ts  init do Firebase Client SDK (lazy)
│   ├── auth.ts      wrappers do Firebase Auth com erros em PT-BR
│   └── api.ts       cliente HTTP (Bearer token, retry de 401, ApiError)
└── types/           DTOs espelhando a API
```

## Autenticação

Login/cadastro/recuperação de senha são 100% Firebase (frontend). O backend só
**verifica** o ID Token enviado em `Authorization: Bearer <token>`. No primeiro
acesso o backend cria o `Usuario` automaticamente — não há rota de "registrar".

## Limitação conhecida

Criar uma rotina pelo **Chat com IA** exige crédito na conta OpenAI configurada no
backend. Sem crédito, `POST /api/rotinas/chat` responde `503` e a tela mostra uma
mensagem amigável (o restante do app funciona normalmente).
