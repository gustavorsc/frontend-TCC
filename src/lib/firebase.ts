import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Inicialização do Firebase Client SDK.
 *
 * O frontend usa o Firebase apenas para autenticação (login/cadastro/recuperação
 * de senha). O backend somente verifica o ID Token — não gerencia sessão.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

// Não lançamos no carregamento do módulo — isso quebraria o build/prerender.
// Em runtime no navegador, um config incompleto é um erro de setup: avisa alto
// no console; a própria chamada ao Firebase falha depois com `auth/...`.
if (missing.length > 0 && typeof window !== "undefined") {
  console.error(
    `[firebase] Config ausente: ${missing.join(", ")}. ` +
      `Preencha o .env.local (veja .env.local.example).`,
  );
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/**
 * `getAuth` valida a API key na hora da chamada e lança com config inválido.
 * Acessamos via função (lazy) para que o build/prerender — que não tem as env
 * `NEXT_PUBLIC_FIREBASE_*` — nunca dispare essa validação. Em runtime no
 * navegador a instância é criada uma única vez.
 */
let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}
