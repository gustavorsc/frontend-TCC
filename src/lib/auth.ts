/**
 * Wrappers de autenticação do Firebase Client SDK.
 *
 * O frontend fala com o Firebase para login/cadastro/recuperação de senha; o
 * backend apenas verifica o ID Token (ver CLAUDE.md → "Autenticação").
 *
 * Estas funções normalizam os erros do Firebase (`error.code` como
 * `auth/invalid-credential`) em mensagens amigáveis em português para a UI.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

/** Erro de auth já com mensagem pronta para exibir na tela. */
export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const MENSAGENS: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  "auth/popup-closed-by-user": "Janela do Google fechada antes de concluir.",
  "auth/network-request-failed":
    "Falha de conexão. Verifique sua internet e tente de novo.",
};

function toAuthError(err: unknown): AuthError {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "auth/unknown";
  return new AuthError(
    code,
    MENSAGENS[code] ?? "Não foi possível concluir. Tente novamente.",
  );
}

export async function cadastrarComEmail(
  email: string,
  senha: string,
  nome?: string,
): Promise<UserCredential> {
  try {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      senha,
    );
    if (nome) {
      await updateProfile(cred.user, { displayName: nome });
    }
    return cred;
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function entrarComEmail(
  email: string,
  senha: string,
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(getFirebaseAuth(), email, senha);
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function entrarComGoogle(): Promise<UserCredential> {
  try {
    return await signInWithPopup(getFirebaseAuth(), googleProvider);
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function recuperarSenha(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (err) {
    throw toAuthError(err);
  }
}

export async function sair(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch (err) {
    throw toAuthError(err);
  }
}
