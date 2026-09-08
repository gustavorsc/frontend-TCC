"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";

/**
 * Protege as rotas autenticadas — sem `firebaseUser`, manda para `/login`.
 * (O cliente HTTP também redireciona em `401`; aqui é a guarda de navegação.)
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { firebaseUser, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !firebaseUser) {
      router.replace("/login");
    }
  }, [carregando, firebaseUser, router]);

  if (carregando || !firebaseUser) {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
