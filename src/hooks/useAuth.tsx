"use client";

/**
 * Estado de autenticação global (CLAUDE.md → "Estado do usuário autenticado num
 * contexto/hook único").
 *
 * Responsabilidades:
 * - Observar o Firebase (`onAuthStateChanged`) e expor `firebaseUser`.
 * - Fornecer o ID Token ao cliente HTTP (`setTokenProvider`) e reagir a `401`
 *   redirecionando para `/login` (`setUnauthorizedHandler`).
 * - No primeiro login, chamar `GET /api/usuarios/me` — o backend cria o
 *   `Usuario` se não existir — e manter esse `Usuario` em memória.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { api, setTokenProvider, setUnauthorizedHandler } from "@/lib/api";
import {
  cadastrarComEmail,
  entrarComEmail,
  entrarComGoogle,
  recuperarSenha,
  sair,
} from "@/lib/auth";
import type { Usuario } from "@/types";

interface AuthContextValue {
  /** Usuário do Firebase (fonte de verdade da sessão). `null` = deslogado. */
  firebaseUser: User | null;
  /** Perfil vindo do backend (`GET /api/usuarios/me`). */
  usuario: Usuario | null;
  /**
   * Nome para exibição. Prefere o `displayName` do Firebase: logo após o
   * cadastro por e-mail o backend ainda registra `nome = e-mail` (o token novo
   * não carrega o `displayName` que o `updateProfile` acabou de gravar).
   */
  nomeExibicao: string | null;
  /** `true` enquanto o estado inicial de auth ainda não foi resolvido. */
  carregando: boolean;
  entrarComEmail: typeof entrarComEmail;
  cadastrarComEmail: typeof cadastrarComEmail;
  entrarComGoogle: typeof entrarComGoogle;
  recuperarSenha: typeof recuperarSenha;
  sair: () => Promise<void>;
  /** Recarrega `GET /api/usuarios/me` (ex.: após ganhar XP). */
  recarregarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // `displayName` do Firebase copiado para o state (o objeto User é mutável e o
  // `updateProfile` do cadastro por e-mail roda depois do onAuthStateChanged).
  const [nomeFirebase, setNomeFirebase] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Mantém o usuário atual acessível ao tokenProvider sem recriá-lo.
  // Atualizado dentro do callback do `onAuthStateChanged` (abaixo), antes de
  // qualquer chamada à API, para o token nunca sair defasado.
  const firebaseUserRef = useRef<User | null>(null);

  // Registra as pontes com o cliente HTTP uma única vez.
  useEffect(() => {
    setTokenProvider(
      (forceRefresh) =>
        firebaseUserRef.current?.getIdToken(forceRefresh) ?? null,
    );
    setUnauthorizedHandler(() => {
      router.replace("/login");
    });
    return () => {
      setTokenProvider(() => null);
      setUnauthorizedHandler(null);
    };
  }, [router]);

  const carregarUsuario = useCallback(async () => {
    try {
      const me = await api<Usuario>("/api/usuarios/me");
      setUsuario(me);
    } catch {
      // O handler de 401 já cuida do redirect; outros erros deixam `usuario`
      // nulo e as telas mostram seu próprio estado de erro.
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    // Watchdog: se o Firebase não responder (config errada, offline), não deixa
    // o app preso no loader — segue como "visitante".
    const watchdog = setTimeout(() => {
      setCarregando((atual) => {
        if (atual) {
          console.warn(
            "[auth] onAuthStateChanged não respondeu a tempo; assumindo sem sessão.",
          );
        }
        return false;
      });
    }, 5000);

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        clearTimeout(watchdog);
        firebaseUserRef.current = user;
        setFirebaseUser(user);
        setNomeFirebase(user?.displayName ?? null);
        if (user) {
          await carregarUsuario();
        } else {
          setUsuario(null);
        }
        setCarregando(false);
      });
    } catch (e) {
      // Config de Firebase ausente/inválida: não deixa a árvore em branco —
      // as telas renderizam como "visitante" e a ação de auth mostra o erro.
      // (fora do corpo síncrono do efeito para não encadear renders)
      console.error("[auth] Falha ao inicializar o Firebase:", e);
      clearTimeout(watchdog);
      queueMicrotask(() => setCarregando(false));
    }

    return () => {
      clearTimeout(watchdog);
      unsubscribe();
    };
  }, [carregarUsuario]);

  const handleSair = useCallback(async () => {
    await sair();
    setUsuario(null);
    router.replace("/login");
  }, [router]);

  const handleCadastrar = useCallback<typeof cadastrarComEmail>(
    async (email, senha, nome) => {
      const cred = await cadastrarComEmail(email, senha, nome);
      // O onAuthStateChanged já disparou com `displayName` vazio; agora que o
      // `updateProfile` rodou, ressincroniza o nome e recarrega o perfil (o
      // token já foi renovado em cadastrarComEmail e carrega o `name`).
      setNomeFirebase(firebaseUserRef.current?.displayName ?? nome ?? null);
      await carregarUsuario();
      return cred;
    },
    [carregarUsuario],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      usuario,
      nomeExibicao:
        nomeFirebase ?? usuario?.nome ?? firebaseUser?.email ?? null,
      carregando,
      entrarComEmail,
      cadastrarComEmail: handleCadastrar,
      entrarComGoogle,
      recuperarSenha,
      sair: handleSair,
      recarregarUsuario: carregarUsuario,
    }),
    [
      firebaseUser,
      usuario,
      nomeFirebase,
      carregando,
      handleSair,
      handleCadastrar,
      carregarUsuario,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  }
  return ctx;
}
