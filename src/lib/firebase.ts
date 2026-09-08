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

function assertConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Firebase config ausente: ${missing.join(", ")}. Verifique o .env.local (veja .env.local.example).`,
    );
  }
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : (assertConfig(), initializeApp(firebaseConfig));

export const auth: Auth = getAuth(firebaseApp);
