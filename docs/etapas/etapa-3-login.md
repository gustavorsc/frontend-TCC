# Etapa 3 — Design system + tela de Login

**Branch:** `etapa-3-telas-auth`

Primeira fatia da camada visual. Base: os arquivos do protótipo Figma Make
(`Login.tsx`, `Card`, `Button`, `ProgressBar`, paleta dark slate/indigo),
refeitos para a stack Next.js + Tailwind v4 (sem `react-router`).

Escopo desta etapa: **apenas a tela de login**. Cadastro, recuperar-senha e
landing entram nas próximas.

## O que foi entregue

### Design system
- **`src/app/globals.css`** — tema único dark: fundo `--color-canvas` (#0b1120),
  superfície `--color-surface` (#131b2c), fontes (`--font-sans` Inter,
  `--font-heading` Sora), utilitários `glow-brand/-warning/-success`,
  `animate-entrance` (entrada em CSS puro, respeita `prefers-reduced-motion`) e
  `scrollbar-hide`.
- **`src/app/layout.tsx`** — troca Geist → Inter + Sora via `next/font`.

### Primitivos — `src/components/ui/`
| Componente | Notas |
|---|---|
| `Button` | variantes `primary/secondary/outline/ghost`, tamanhos `sm/md/lg`, `fullWidth`, `loading` (spinner), vira `<Link>` quando recebe `href` |
| `Card` | `glow?: brand \| warning \| success` |
| `ProgressBar` | `progress` (clamp 0–100), `color`, `height`, `showLabel`, com `role="progressbar"` |
| `TextField` | label + hint/erro acessíveis (`aria-invalid`, `aria-describedby`), toggle de senha (olho), `labelAction` (ex.: "Esqueceu a senha?") |
| `Alert` | `tone: error \| success \| info` |
| `FullscreenLoader` | usado pelas guardas de rota |

### Marca — `src/components/brand/`
`Logo` (símbolo GraduationCap + wordmark "Rotinas") e `GoogleIcon` (SVG inline).

### Guardas de rota — `src/components/auth/`
- `GuestGate` — rotas de visitante; com sessão ativa → `/dashboard`.
- `AuthGate` — rotas autenticadas; sem sessão → `/login`. (pronto para o grupo
  `(app)` da Etapa 4)

### Rotas
- **`src/app/(auth)/layout.tsx`** — casca centralizada + `GuestGate` + logo.
- **`src/app/(auth)/login/page.tsx`** — formulário ligado ao `useAuth`
  (`entrarComEmail`, `entrarComGoogle`), estados de `loading` por ação, erros
  traduzidos (`AuthError` → PT-BR) via `Alert`. Sucesso → `router.replace('/dashboard')`.

### Ajuste em `src/hooks/useAuth.tsx`
- `onAuthStateChanged` protegido por `try/catch` — config de Firebase
  ausente/inválida não deixa mais a árvore em branco.
- **Watchdog de 5s**: se o Firebase não responder (offline / config errada), o
  app sai do loader e segue como visitante em vez de travar.

## Verificação
- `npx eslint src` — limpo
- `npx next build` — passa (`/` e `/login` prerenderizados sem env de Firebase)
- Screenshots em 360 / 768 / 1280 px — sem overflow horizontal (RNF03)

## Pendências conhecidas
- Links "Cadastre-se" (`/cadastro`) e "Esqueceu a senha?" (`/recuperar-senha`)
  ainda dão 404 — telas da próxima etapa.
- Redirect de sucesso aponta para `/dashboard`, que só existe na Etapa 4.
- `next.config.ts`: `agentRules: false` — impede o `next dev` (Next 16) de
  reescrever o `CLAUDE.md` do projeto.
- `src/types/index.ts` ainda tem campos inferidos (`// ?`).
